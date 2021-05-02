const path = require('path')
const { ipcRenderer } = require('electron')
const osu = require('node-os-utils')
const si = require('systeminformation');
const { rejects } = require('assert');
const cpu = osu.cpu
const mem = osu.mem
const os = osu.os

let cpuOverload
let alertFrequency 

// Get Settings & Values
ipcRenderer.on('settings:get', (e, settings) => {
    cpuOverload = +settings.cpuOverload
    alertFrequency = +settings.alertFrequency
} )

// Run every 2 sec
setInterval(() => {
    // CPU Usage
    cpu.usage().then(info =>{
        document.getElementById('cpu-usage').innerText = info + '%'

        document.getElementById('cpu-progress').style.width = info + '%'

        // Make progress bar red if overload
        if (info > cpuOverload) {
        document.getElementById('cpu-progress').style.background = 'red'  
        } else {
            document.getElementById('cpu-progress').style.background = '#034694'
        }

        // Check overload
        // if (info >= cpuOverload && runNotify(alertFrequency)) {
        //     notifyUser({
        //         title: 'CPU Overload',
        //         body: `CPU is over ${cpuOverload}%`,
        //         icon: path.join(__dirname, 'img', 'icons.png'),
        //       });

        //       localStorage.setItem('lastNotify', +new Date())
        // }
    })

    // CPU Free
    cpu.free().then((info) => {
        document.getElementById('cpu-free').innerText = info + '%'
    })
    
    // Uptime
    document.getElementById('sys-uptime').innerText = secondToDhms(os.uptime())
}, 1000)


// Set model
document.getElementById('processor').innerText = cpu.model()

// Computer Name
document.getElementById('comp-name').innerText = os.hostname()

// Motherboard
si.baseboard().then(data => {
    document.getElementById('motherboard').innerHTML = `${data.manufacturer} ${data.model}`
});

// Disks/HDD/SSD
// si.diskLayout().then(data => {
//     document.getElementById('disks').innerHTML = `${data[0].name}`
// });

// si.getAllData().then(data => console.log(data))

// Total Mem
mem.info().then((info) => {
    // http://bit.ly/3sjXBlZ
    document.getElementById('mem-total').innerText = Math.floor(info.totalMemMb / 1000) + ' GB'
})

si.osInfo(function(res, err) {
    if (err) {
        reject(err)
    }

    document.getElementById('os').innerText = `${res.distro} (${res.arch})`
})


si.graphics(function(res, err) {
    if (err) {
        rejects(reject)
    }

    document.getElementById('vga').innerText = res.controllers[0].model
})


// Show days, hours, min, sec
function secondToDhms(seconds) {
    second = +seconds
    const d = Math.floor(seconds / (3600 * 24))
    const h = Math.floor((seconds % (3600 * 24)) / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return `${d}d, ${h}h, ${m}m, ${s}s`
}

// Send notification
function notifyUser(options) {
    new Notification(options.title, options);
}

// Check how much time has passed since Notification
function runNotify(frequency) {
    if (localStorage.getItem('lastNotify') === null) {
        // Store timestamp
        localStorage.setItem('lastNotify', +new Date())
        return true
    }
    const notifyTime = new Date(parseInt(localStorage.getItem('lastNotify')))
    const now = new Date()
    const diffTime = Math.abs(now - notifyTime)
    const minutesPassed = Math.ceil(diffTime / (1000 * 60))

    if (minutesPassed > frequency) {
        return true
    } else {
        return false
    }
}