let body = document.getElementById("body");
let audioContext = new AudioContext();
let noteStartTime;
const fadeTime = 0.8;
const notes = [
    {
        note: "C",
        blackKey: false,
        freq: 130.81
    },
    {
        note: "C#",
        blackKey: true,
        freq: 138.59
    },
    {
        note: "D",
        blackKey: false,
        freq: 146.83
    },
    {
        note: "D#",
        blackKey: true,
        freq: 155.56
    },
    {
        note: "E",
        blackKey: false,
        freq: 164.81
    },
    {
        note: "F",
        blackKey: false,
        freq: 174.61
    },
    {
        note: "F#",
        blackKey: true,
        freq: 185
    },
    {
        note: "G",
        blackKey: false,
        freq: 196
    },
    {
        note: "G#",
        blackKey: true,
        freq: 207.65
    },
    {
        note: "A",
        blackKey: false,
        freq: 220
    },
    {
        note: "A#",
        blackKey: true,
        freq: 233.08
    },
    {
        note: "B",
        blackKey: false,
        freq: 246.94
    },
    {
        note: "C",
        blackKey: false,
        freq: 261.63
    },
]


notes.forEach(note => {
    {
        let pianoKey = document.createElement("button");
        pianoKey.className = "reset-button pianoKey";
        if(note.blackKey){
            pianoKey.className += " blackKey";
        }
        body.appendChild(pianoKey);

        pianoKey.addEventListener("mousedown", (e)=>handleKeyPress(e, note));
    }
})

function handleKeyPress(e, note) {
    playTone(e.target, note);
}

async function playTone(pressedKey, note) {
    noteStartTime = audioContext.currentTime;
    let gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    let osc = audioContext.createOscillator();
    osc.connect(gain);
    osc.type = "triangle";
    osc.frequency.value = note.freq;
    osc.start();
    await new Promise((resolve)=>{
        pressedKey.addEventListener("mouseup", ()=>resolve());
    });
    const stopTime = audioContext.currentTime + fadeTime;
    gain.gain.exponentialRampToValueAtTime(.001, stopTime)
    osc.stop(stopTime);

}