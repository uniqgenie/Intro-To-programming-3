const MOVES = ["rock", "paper", "scissors"];

function beats(one, two) {
  return (
    (one === "rock" && two === "scissors") ||
    (one === "scissors" && two === "paper") ||
    (one === "paper" && two === "rock")
  );
}

function roundWinner(m1, m2) {
  if (beats(m1, m2)) return 1;
  if (beats(m2, m1)) return 2;
  return 0;
}

// --- UI ---
const el = {
  playerName: document.getElementById("playerName"),
  opponent: document.getElementById("opponent"),
  matchType: document.getElementById("matchType"),
  startBtn: document.getElementById("startBtn"),
  quitBtn: document.getElementById("quitBtn"),
  status: document.getElementById("status"),
  log: document.getElementById("log"),
  p1Label: document.getElementById("p1Label"),
  p2Label: document.getElementById("p2Label"),
  p1Score: document.getElementById("p1Score"),
  p2Score: document.getElementById("p2Score"),
  roundNum: document.getElementById("roundNum"),
  moveBtns: Array.from(document.querySelectorAll(".moveButtons .btn")),
};

// --- Game state ---
let state = null;

function newGame() {
  const humanName = (el.playerName.value || "Human").trim();
  const opponentType = el.opponent.value;
  const targetWinsRaw = parseInt(el.matchType.value, 10);
  const targetWins = targetWinsRaw === 0 ? null : targetWinsRaw;

  state = {
    humanName,
    opponentType,
    targetWins,
    roundsPlayed: 0,
    p1Score: 0,
    p2Score: 0,
    humanMoves: [],
    computerMoves: [],
    active: true,
  };

  el.p1Label.textContent = humanName;
  el.p2Label.textContent = `Computer (${labelFor(opponentType)})`;
  el.p1Score.textContent = "0";
  el.p2Score.textContent = "0";
  el.roundNum.textContent = "0";
  el.log.innerHTML = "";
  el.status.innerHTML = `Match started. Choose a move!`;

  el.moveBtns.forEach((b) => (b.disabled = false));
  el.quitBtn.disabled = false;
}

function labelFor(type) {
  return (
    {
      rock: "Always Rock",
      random: "Random",
      reflect: "Reflect",
      cycle: "Cycle",
    }[type] || "Random"
  );
}

// --- Computer strategies (match your Python logic) ---
function computerMove() {
  const { opponentType, computerMoves, humanMoves } = state;

  if (opponentType === "rock") return "rock";

  if (opponentType === "random") {
    return MOVES[Math.floor(Math.random() * MOVES.length)];
  }

  if (opponentType === "reflect") {
    if (humanMoves.length > 0) return humanMoves[humanMoves.length - 1];
    return MOVES[Math.floor(Math.random() * MOVES.length)];
  }

  if (opponentType === "cycle") {
    if (computerMoves.length === 0) {
      return MOVES[Math.floor(Math.random() * MOVES.length)];
    }
    const last = computerMoves[computerMoves.length - 1];
    const idx = MOVES.indexOf(last);
    return MOVES[(idx + 1) % MOVES.length];
  }

  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

function endMatch(reasonText) {
  state.active = false;
  el.moveBtns.forEach((b) => (b.disabled = true));
  el.quitBtn.disabled = true;

  const p1 = state.p1Score;
  const p2 = state.p2Score;

  let winnerText = "Match ended in a tie.";
  if (p1 > p2) winnerText = `Winner: ${state.humanName}`;
  if (p2 > p1) winnerText = `Winner: ${el.p2Label.textContent}`;

  el.status.innerHTML = `${reasonText}<br><b>Final score:</b> ${state.humanName} ${p1} — ${p2} ${el.p2Label.textContent}<br>${winnerText}`;
}

function playRound(humanMove) {
  if (!state || !state.active) return;

  const comp = computerMove();

  state.roundsPlayed += 1;
  state.humanMoves.push(humanMove);
  state.computerMoves.push(comp);

  const w = roundWinner(humanMove, comp);
  let line = `Round ${state.roundsPlayed}: ${state.humanName} played <b>${humanMove}</b>, Computer played <b>${comp}</b>. `;

  if (w === 1) {
    state.p1Score += 1;
    line += `<b>${state.humanName} wins</b>`;
  } else if (w === 2) {
    state.p2Score += 1;
    line += `<b>Computer wins</b>`;
  } else {
    line += `<b>Tie</b>`;
  }

  el.p1Score.textContent = String(state.p1Score);
  el.p2Score.textContent = String(state.p2Score);
  el.roundNum.textContent = String(state.roundsPlayed);

  const li = document.createElement("li");
  li.innerHTML = line;
  el.log.prepend(li);

  // Target wins logic (best-of)
  if (state.targetWins !== null) {
    if (state.p1Score >= state.targetWins) {
      endMatch(`Reached ${state.targetWins} wins.`);
    } else if (state.p2Score >= state.targetWins) {
      endMatch(`Reached ${state.targetWins} wins.`);
    }
  } else {
    // Until quit: keep going
    el.status.innerHTML = `Keep playing, or click <b>Quit match</b>.`;
  }
}

// --- Events ---
el.startBtn.addEventListener("click", newGame);

el.quitBtn.addEventListener("click", () => {
  if (!state || !state.active) return;
  endMatch("You quit the match.");
});

el.moveBtns.forEach((btn) => {
  btn.addEventListener("click", () => playRound(btn.dataset.move));
});

// Initial labels
el.p1Label.textContent = "Human";
el.p2Label.textContent = "Computer (Random)";
