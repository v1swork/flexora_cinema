console.log("Js подключён")

const HIDE_DELAY = 3000 // через сколько будет скрыта панель "controls"
const SEEK_STEP = 10

const introStart = parseTime("0:0:0") // тайминг появления кнопок (интро)
const introEnd = parseTime("0:0:36") // куда перематывать (интро)

const outroStart = parseTime("1:57:20") // тайминг появления кнопок (аутро)
const outroEnd = parseTime("2:05:14") // куда перематывать (аутро)

skipIntroBtn = document.getElementById("skipBtn")
div_seek_wrap = document.getElementById("seek-wrap")
skipskipBtn = document.getElementById("skipskipBtn")

function parseTime(t) {
    const parts = String(t).trim().split(":").map(Number)
    if (parts.some(n => Number.isNaN(n))) return 0
    let res = 0, partsLen = parts.length-1
    for (let p of parts) {
        res += p*(60**partsLen)
        partsLen--
    }
    return res
}

function updateSkipIntroButton(Time) {
    const t = Number.isFinite(Time) ? Time : video.currentTime
    let shoudShow = t >= introStart && t < introEnd || t >= outroStart && t < outroEnd
    div_seek_wrap.classList.toggle("hidden", !shoudShow)
}

skipIntroBtn.addEventListener("click", () => {
    const target = Math.min(introEnd, Number.isFinite(video.duration) ? video.duration : introEnd)
    video.currentTime = target
    updateSkipIntroButton()
})
const video = document.getElementById("video")
const playbtn = document.getElementById("playBtn")

function syncPlayicon() {
    playbtn.textContent = video.paused ? "►" : "⏸"
}

playbtn.addEventListener("click", () => {
    if (video.paused) video.play()
    else video.pause();
    syncPlayicon()
})
skipskipBtn.addEventListener("click", () => {
    div_seek_wrap.classList.add("hidden")
})
video.addEventListener("play", syncPlayicon)
video.addEventListener("pause", syncPlayicon)

function fmt(sec, showHours = false) {
    if (!Number.isFinite(sec)) sec = 0;
    sec = Math.max(0, Math.floor(sec))
    const h = Math.floor(sec / 3600)
    const m = Math.floor((sec % 3600)/ 60)
    const s = sec % 60   

    if (h > 0 || showHours) {
        return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    }
    else {
        return `${m}:${String(s).padStart(2, "0")}` 
    }
}

const seek = document.getElementById("seek")
const timeEl = document.getElementById("time")

let showHours = false
let isSeeking = false

function loadmetadata() {
    seek.max = video.duration;
    showHours = video.duration >= 3600
    timeEl.textContent = `${fmt(0, showHours)} / ${fmt(video.duration, showHours)}`
}

video.addEventListener("loadedmetadata", () => {
    loadmetadata()
    updateSkipIntroButton(true)
    })

video.addEventListener("timeupdate", () => {
    if (!isSeeking) seek.value = video.currentTime;
    timeEl.textContent = `${fmt(Number(seek.value), showHours)} / ${fmt(video.duration, showHours)}`
    updateSkipIntroButton(true)
})

seek.addEventListener("input", () => {
    isSeeking = true
    timeEl.textContent = `${fmt(Number(seek.value), showHours)} / ${fmt(video.duration, showHours)}`
    updateSkipIntroButton(true)
})

seek.addEventListener("change", () => {
    video.currentTime = seek.value
    isSeeking = false
    timeEl.textContent = `${fmt(Number(seek.value), showHours)} / ${fmt(video.duration, showHours)}`
})

const player = document.getElementById("player")
const fsBtn = document.getElementById("fsBtn")

function isFullScreen() {
    return document.fullscreenElement === player
}

async function toggleFullScreen() {
    try {
        if (!isFullScreen()) {
            await player.requestFullscreen()
        }
        else {
            await document.exitFullscreen()
        }
    }
    catch (e) {
        console.error("Ошибка полноэкранного режима: ", e)
    }
}

fsBtn.addEventListener("click", toggleFullScreen)

window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "f" || e.repeat) return 
    toggleFullScreen()
})

window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
        e.preventDefault()
        showControls()
        if (e.repeat) return
        if (video.paused) video.play()
        else video.pause()
        syncPlayicon()
        return
    }
    if (e.code === "ArrowRight") {
        e.preventDefault()
        showControls()
        const dur = Number.isFinite(video.duration) ? video.duration : Infinity
        video.currentTime = Math.min(video.currentTime + SEEK_STEP, dur)
        return 
    }
    if (e.code === "ArrowLeft") {
        e.preventDefault()
        showControls()
        video.currentTime = Math.max(video.currentTime - SEEK_STEP, 0)
        
        return 
    }
})
const controls = document.querySelector(".controls")


let hideTimer = null

function hideControlNow() {
    if (!video.paused) controls.classList.add("hidden")
}

function showControls() {
    controls.classList.remove("hidden")

    if (hideTimer) clearTimeout(hideTimer)
    
    hideTimer = setTimeout(hideControlNow, HIDE_DELAY)
}

window.addEventListener("mousemove", showControls)
player.addEventListener("mouseleave", hideControlNow)

syncPlayicon()
loadmetadata()
showControls()

