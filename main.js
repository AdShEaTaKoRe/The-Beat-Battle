// creation of global variables
// player sounds and DJ sounds are loaded separately, to allow synch playing
const soundsPlayer = document.querySelectorAll(".sound");
const soundsDJ = document.querySelectorAll(".sound");
const notes = Array.from(document.querySelectorAll(".note"));
const notesCols = Array.from(document.querySelectorAll(".notes-col"));
let musicPlaying;
let playerScore = 0;

let tempo = 120;
let timeoutTempo = 60000 / (tempo * 2);


// load sounds for the pad
window.addEventListener("load", () => {
  const pads = document.querySelectorAll(".note-def");
  // controls the bottom pads to play sounds
  pads.forEach((pad, index) => {
    pad.addEventListener("click", function () {
      soundsPlayer[index].currentTime = 0;
      soundsPlayer[index].play();
    });
  });
});

// listener for the buttons on the beat maker section
window.addEventListener("load", () => {
  notes.forEach(note => {
    note.addEventListener("click", function () {
      note.classList.toggle("highlighted");
      const rowsToggle = note.id.split("-")[1];
      const colsToggle = note.id.split("-")[2];
      partitionUser[rowsToggle][colsToggle] = !partitionUser[rowsToggle][colsToggle];
    });
  });
});

// Playing 1 bar of sounds generated by the user
function playBeat(soundsArr, partitionArr) {
  partitionArr.forEach((s, i) => {
    if (s) {
      soundsArr[i].currentTime = 0;
      soundsArr[i].play();
    }
  });
}

// playing the whole partition (loops trough each bar)
function playMusic(soundsArr, partition, tempo) {
  let counter = 0;
  musicPlaying = setInterval(function () {
    playBeat(soundsArr, partition[counter]);
    highlightCol(counter);
    counter++;
    if (counter === partition.length) {
      counter = 0;
      giveFeedbackToPlayer();
    }
  }, tempo);
}

// computer plays a beat and player has to reproduce, loop stops after 2 times
function playDJ(soundsArr, partition, tempo) {
  let counter = 0;
  let countTimes = 0;
  djPlaying = setInterval(function () {
    playBeat(soundsArr, partition[counter]);
    counter++;
    countTimes++;
    if (counter === partition.length) counter = 0;
    if (countTimes === 16) clearInterval(djPlaying);
  }, tempo);
}

// highlights the current playing bar
function highlightCol(index) {
  notesCols.forEach(col => col.classList.remove("notes-col-highlighted"));
  notesCols[index].classList.add("notes-col-highlighted");
}

// updates the tempo when the user changes the value
function updateTempoValue(val) {
  document.getElementById("tempo-disp").innerText = "Tempo: " + val;
  tempo = val;
  timeoutTempo = 60000 / (tempo * 2);
  clearInterval(musicPlaying);
  playMusic(soundsPlayer, partitionUser, timeoutTempo);
}

// stops the player music from playing
function stopPlaying() {
  clearInterval(musicPlaying);
}

// checks if the user is reproducing the pattern well

function compareMusic(modelPartition, userPartition) {
  const modelPartFlat = modelPartition.flat(2);
  const userPartFlat = userPartition.flat(2);
  const compareLength = modelPartFlat.reduce((acc, value) => {
    if (value) acc++
    return acc;
  });

  let compareScore = 0;
  userPartFlat.forEach((note, index) => {
    if (modelPartFlat[index] && note === modelPartFlat[index]) compareScore++;
  });
  let finalScore = (compareScore / compareLength) * 100;
  return finalScore;
}

function compareTempo(modelTempo, userTempo) {
  const difference = Math.abs(userTempo - modelTempo) / modelTempo;
  return difference * 10;
}

function giveScore(modelPartition, userPartition, modelTempo, userTempo) {
  const tempoDiff = compareTempo(modelTempo, userTempo);
  const musicScore = compareMusic(modelPartition, userPartition);
  const currentScore = (musicScore - tempoDiff).toFixed(0);
  return Math.max(currentScore, 0);
}

// compares what user does with what is needed and returns the
//score in the feedback area

function giveFeedbackToPlayer() {
  let feedbackZone1 = document.getElementById('feedback-zone1');
  let feedbackZone2 = document.getElementById('feedback-zone2');
  let currentScore = giveScore(partitionDJ, partitionUser, timeoutTempoDJ, timeoutTempo);
  const comment = generateComment(currentScore);
  feedbackZone1.innerText = currentScore + "% correct";
  feedbackZone2.innerText = comment;
}

// generating a comment depending on the current score
function generateComment(score) {
  let comment = "";
  if (score < 25) {
    comment = "Nothing's going on, boooo!";
  } else if (score < 50) {
    comment = "Keep trying, padawan";
  } else if (score < 70) {
    comment = "getting closer";
  } else if (score < 85) {
    comment = "Wow, that's gut!";
  } else if (score < 100) {
    comment = "Yea, that's a beat!";
  } else {
    comment = "Yess! Perfekt! ";
  }
  return comment;
}

function validateRound(score, difficulty) {
  playerScore += (score * difficulty);
}