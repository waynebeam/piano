let body = document.getElementById("body");
const notes = [
    {
        note: "C",
        blackKey: false
    },
    {
        note: "C#",
        blackKey: true
    },
    {
        note: "D",
        blackKey: false
    },
    {
        note: "D#",
        blackKey: true
    },
    {
        note: "E",
        blackKey: false
    },
    {
        note: "F",
        blackKey: false
    },
    {
        note: "F#",
        blackKey: true
    },
    {
        note: "G",
        blackKey: false
    },
    {
        note: "G#",
        blackKey: true
    },
    {
        note: "A",
        blackKey: false
    },
    {
        note: "A#",
        blackKey: true
    },
    {
        note: "B",
        blackKey: false
    },
    {
        note: "C",
        blackKey: false
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
    }
})