let keyboardContainer = document.getElementById("keyboardContainer");
let audioContext = new AudioContext();
let firstNoteStartTime;
let currNoteStartTime;
const fadeTime = 0.8;
let recording = false;
let playing = false;
let recordedNotes = [];
let recordingTime;
let playButton = document.createElement("div");
let recordButton = document.createElement("div");



const chordControls = {
    majorChord: {
        key: "a",
        description: "Major Chord",
        control: false
    },
    minorChord: {
        key: "e",
        description: "Minor Chord",
        control: false
    },
    seventhChord: {
        key: "s",
        description: "Seventh",
        control: false
    },
    dimChord: {
        key: "d",
        description: "Diminished Chord",
        control: false
    },
    firstInversionChord: {
        key: "f",
        description: "first inversion",
        control: false
    },
    secondInversionChord: {
        key: "v",
        description: "second inversion",
        control: false
        
    }
}

function init() {
    setupKeyboard();
    setUpKeyListeners();
    setupDirections();
    setupButtons();
}

function setupKeyboard() {
    notes.forEach((note, idx) => {
        {
            let pianoKey = document.createElement("div");
            pianoKey.className = "reset-button pianoKey";
            note.freq = noteFrequencies[note.note];
            note.index = idx;
            note.pianoKey = pianoKey;
            if (note.blackKey) {
                pianoKey.className += " blackKey";
            }
            keyboardContainer.appendChild(pianoKey);

            pianoKey.addEventListener("mousedown", (e) => handleNoteClicked(e, note));
        }
    })
}

function setUpKeyListeners() {
    for (let key in chordControls) {
        let keyControl = chordControls[key];
        document.addEventListener("keypress", (e) => {
            if (e.key === keyControl.key && !keyControl.control) {
                keyControl.control = true;
            }
        })
        document.addEventListener("keyup", e => {
            if (e.key === keyControl.key) {
                keyControl.control = false;
            }
        })
    }

}


function setupDirections() {
    let directionsContainer = document.getElementById("directionsContainer");
    let p = document.createElement("p");
    p.innerHTML = "Click a key to play a note";
    directionsContainer.appendChild(p);
    for (key in chordControls) {
        let keyControl = chordControls[key];
        let p = document.createElement("p");
        p.innerHTML = `Hold "${keyControl.key}" to play a ${keyControl.description}`;
        directionsContainer.appendChild(p);
    }
}

function setupButtons() {
    let buttonsContainer = document.getElementById("directionsAndButtonsContainer");
    recordButton.className = "recordButton";
    recordButton.innerHTML = "⏺";
    buttonsContainer.appendChild(recordButton);
    recordButton.addEventListener("click", () => toggleRecord());
    playButton.className = "recordButton";
    playButton.innerHTML = "⏯";
    buttonsContainer.appendChild(playButton);
    playButton.addEventListener("click", () => togglePlay());
}

function toggleRecord() {
    recordButton.classList.toggle("pianoKeyPressed");
    recording = !recording;
    if (recording) {
        recordedNotes = [];
        firstNoteStartTime = audioContext.currentTime;
    }
    if (!recording) {
        recordingTime = audioContext.currentTime - firstNoteStartTime;
    }
}

function togglePlay() {
    if (!playing) {
        if (recordedNotes.length) {
            playButton.classList.toggle("pianoKeyPressed");
            if (recording) {
                toggleRecord();
            }
            playing = true;
            replayNotes(recordedNotes);
        }
    }


}

function handleNoteClicked(e, rootNote) {
    let majorChord = chordControls.majorChord.control;
    let minorChord = chordControls.minorChord.control;
    let diminished = chordControls.dimChord.control;
    let seventh = chordControls.seventhChord.control;
    let firstInversionChord = chordControls.firstInversionChord.control;
    let secondInversionChord = chordControls.secondInversionChord.control;

    const findIntervals = {
        major: () => {
            let indexes = [rootNote.index+4, rootNote.index + 7];
            if(seventh) indexes.push(rootNote.index + 10);
            return indexes;
        },
        minor: () => {
            let indexes = [rootNote.index+3, rootNote.index + 7];
            if(seventh) indexes.push(rootNote.index + 10);
            return indexes;
        },
        diminished: () => [rootNote.index+3, rootNote.index + 6],
        augmented: () => [rootNote.index+4, rootNote.index + 8],
        majorFirstInversion: () => {
            let indexes = [rootNote.index - 8, rootNote.index - 5];
            if(seventh) indexes.push(rootNote.index - 2);
            return indexes;
        },
        minorFirstInversion: () => {
            let indexes = [rootNote.index - 9, rootNote.index - 5];
            if(seventh) indexes.push(rootNote.index - 2);
            return indexes;
        },
        majorSecondInversion: () => {
            let indexes = [rootNote.index - 5, rootNote.index +4];
            if(seventh) indexes.push(rootNote.index - 2);
            return indexes;
        },
        minorSecondInversion: () => {
            let indexes = [rootNote.index - 5, rootNote.index +3];
            if(seventh) indexes.push(rootNote.index - 2);
            return indexes;
        }

    }

    function getIndexes(){
        if(majorChord && firstInversionChord){
            return findIntervals.majorFirstInversion();
        }
        if(majorChord && secondInversionChord)
            return findIntervals.majorSecondInversion();
        if(majorChord)
            return findIntervals.major();
        if(minorChord && firstInversionChord)
            return findIntervals.minorFirstInversion();
        if(minorChord && secondInversionChord)
            return findIntervals.minorSecondInversion();
        if(minorChord)
            return findIntervals.minor();
        if(diminished)
            return findIntervals.diminished();
        return [];
        
    }
    indexes = getIndexes().filter((index)=>index >= 0 && index< notes.length);
    let notesToPlay = [rootNote];
    indexes.forEach(index=> {
        let note = notes[index];
        note.freq = noteFrequencies[note.note];
        notesToPlay.push(note);
    })
    
    playTone(e.target, ...notesToPlay);

}


async function playTone(pressedKey, ...notes) {
    currNoteStartTime = audioContext.currentTime;
    let oscs = [];
    let newNotes = [];
    let gain = audioContext.createGain();
    gain.connect(audioContext.destination);
    notes.forEach((note) => {
        note.pianoKey.classList.toggle("pianoKeyPressed")
        let osc = audioContext.createOscillator();
        osc.connect(gain);
        osc.type = "triangle";
        osc.frequency.value = note.freq;
        osc.start();
        oscs.push(osc);
        let newNote = { note: note.note, freq: note.freq };
        newNotes.push(newNote);

    })
    await new Promise((resolve) => {
        document.addEventListener("mouseup", () => resolve());
        pressedKey.addEventListener("mouseout", () => resolve());
    });
    const stopTime = audioContext.currentTime + fadeTime;
    gain.gain.exponentialRampToValueAtTime(.001, stopTime);
    oscs.forEach((osc) => {
        osc.stop(stopTime);
    });
    notes.forEach((note) => {
        note.pianoKey.classList.toggle("pianoKeyPressed")
    })
    newNotes.forEach(newNote => {

        newNote.duration = audioContext.currentTime - currNoteStartTime;
        newNote.startTime = currNoteStartTime - firstNoteStartTime;

    })
    if (recording) {
        recordedNotes.push(newNotes);
    }
}

const notes = [
    {
        note: "C3",
        blackKey: false,

    },
    {
        note: "C#3",
        blackKey: true,
    },
    {
        note: "D3",
        blackKey: false,

    },
    {
        note: "D#3",
        blackKey: true,
    },
    {
        note: "E3",
        blackKey: false,

    },
    {
        note: "F3",
        blackKey: false,

    },
    {
        note: "F#3",
        blackKey: true,
    },
    {
        note: "G3",
        blackKey: false,
    },
    {
        note: "G#3",
        blackKey: true,
    },
    {
        note: "A3",
        blackKey: false,
    },
    {
        note: "A#3",
        blackKey: true,
    },
    {
        note: "B3",
        blackKey: false,

    },
    {
        note: "C4",
        blackKey: false,
    },
    {
        note: "C#4",
        blackKey: true,
    },

    {
        note: "D4",
        blackKey: false,

    },
    {
        note: "D#4",
        blackKey: true,
    },
    {
        note: "E4",
        blackKey: false,

    },
    {
        note: "F4",
        blackKey: false,

    },
    {
        note: "F#4",
        blackKey: true,
    },
    {
        note: "G4",
        blackKey: false,
    },
    {
        note: "G#4",
        blackKey: true,
    },
    {
        note: "A4",
        blackKey: false,
    },
    {
        note: "A#4",
        blackKey: true,
    },
    {
        note: "B4",
        blackKey: false,

    },
    {
        note: "C5",
        blackKey: false,
    },
]
const noteFrequencies = {
    'C0': 16.35,
    'C#0': 17.32,
    'Db0': 17.32,
    'D0': 18.35,
    'D#0': 19.45,
    'Eb0': 19.45,
    'E0': 20.60,
    'F0': 21.83,
    'F#0': 23.12,
    'Gb0': 23.12,
    'G0': 24.50,
    'G#0': 25.96,
    'Ab0': 25.96,
    'A0': 27.50,
    'A#0': 29.14,
    'Bb0': 29.14,
    'B0': 30.87,
    'C1': 32.70,
    'C#1': 34.65,
    'Db1': 34.65,
    'D1': 36.71,
    'D#1': 38.89,
    'Eb1': 38.89,
    'E1': 41.20,
    'F1': 43.65,
    'F#1': 46.25,
    'Gb1': 46.25,
    'G1': 49.00,
    'G#1': 51.91,
    'Ab1': 51.91,
    'A1': 55.00,
    'A#1': 58.27,
    'Bb1': 58.27,
    'B1': 61.74,
    'C2': 65.41,
    'C#2': 69.30,
    'Db2': 69.30,
    'D2': 73.42,
    'D#2': 77.78,
    'Eb2': 77.78,
    'E2': 82.41,
    'F2': 87.31,
    'F#2': 92.50,
    'Gb2': 92.50,
    'G2': 98.00,
    'G#2': 103.83,
    'Ab2': 103.83,
    'A2': 110.00,
    'A#2': 116.54,
    'Bb2': 116.54,
    'B2': 123.47,
    'C3': 130.81,
    'C#3': 138.59,
    'Db3': 138.59,
    'D3': 146.83,
    'D#3': 155.56,
    'Eb3': 155.56,
    'E3': 164.81,
    'F3': 174.61,
    'F#3': 185.00,
    'Gb3': 185.00,
    'G3': 196.00,
    'G#3': 207.65,
    'Ab3': 207.65,
    'A3': 220.00,
    'A#3': 233.08,
    'Bb3': 233.08,
    'B3': 246.94,
    'C4': 261.63,
    'C#4': 277.18,
    'Db4': 277.18,
    'D4': 293.66,
    'D#4': 311.13,
    'Eb4': 311.13,
    'E4': 329.63,
    'F4': 349.23,
    'F#4': 369.99,
    'Gb4': 369.99,
    'G4': 392.00,
    'G#4': 415.30,
    'Ab4': 415.30,
    'A4': 440.00,
    'A#4': 466.16,
    'Bb4': 466.16,
    'B4': 493.88,
    'C5': 523.25,
    'C#5': 554.37,
    'Db5': 554.37,
    'D5': 587.33,
    'D#5': 622.25,
    'Eb5': 622.25,
    'E5': 659.26,
    'F5': 698.46,
    'F#5': 739.99,
    'Gb5': 739.99,
    'G5': 783.99,
    'G#5': 830.61,
    'Ab5': 830.61,
    'A5': 880.00,
    'A#5': 932.33,
    'Bb5': 932.33,
    'B5': 987.77,
    'C6': 1046.50,
    'C#6': 1108.73,
    'Db6': 1108.73,
    'D6': 1174.66,
    'D#6': 1244.51,
    'Eb6': 1244.51,
    'E6': 1318.51,
    'F6': 1396.91,
    'F#6': 1479.98,
    'Gb6': 1479.98,
    'G6': 1567.98,
    'G#6': 1661.22,
    'Ab6': 1661.22,
    'A6': 1760.00,
    'A#6': 1864.66,
    'Bb6': 1864.66,
    'B6': 1975.53,
    'C7': 2093.00,
    'C#7': 2217.46,
    'Db7': 2217.46,
    'D7': 2349.32,
    'D#7': 2489.02,
    'Eb7': 2489.02,
    'E7': 2637.02,
    'F7': 2793.83,
    'F#7': 2959.96,
    'Gb7': 2959.96,
    'G7': 3135.96,
    'G#7': 3322.44,
    'Ab7': 3322.44,
    'A7': 3520.00,
    'A#7': 3729.31,
    'Bb7': 3729.31,
    'B7': 3951.07,
    'C8': 4186.01
}

init();


function replayNotes(noteGroups) {
    noteGroups.forEach((noteGroup) => {
        let gain = audioContext.createGain();
        gain.connect(audioContext.destination);
        noteGroup.forEach((note) => {
            let time = setTimeout(() => {
                playBasicSound(gain, note.freq, note.duration, note.oscType);
            }, note.startTime * 1000);
        })

    })

    setTimeout(() => {
        playButton.classList.remove("pianoKeyPressed");
        playing = false;
    }, (recordingTime + noteGroups[noteGroups.length - 1][0].duration) * 1000);

    //if(!notes.length) playBasicSound();
}

async function playBasicSound(gain, freq, duration, oscType = "triangle") {
    const frequency = freq;

    const oscillator = audioContext.createOscillator();
    oscillator.connect(gain);
    oscillator.type = oscType;
    oscillator.frequency.value = frequency;

    oscillator.start();
    await new Promise(resolve => {
        setTimeout(resolve, duration * 1000);
    })
    oscillator.stop(audioContext.currentTime + fadeTime);
    gain.gain.exponentialRampToValueAtTime(.001, audioContext.currentTime + fadeTime);
}

//TODO: make the record and play toggles, play start play stop and record start and record stop