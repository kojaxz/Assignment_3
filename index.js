let clicks = 0;
let matchedPairs = 0;
let totalPairs = 0;
let timeLeft = 0;
let havePowerUp = true;
let timerInterval = null;

const difficulties = {
  easy: { pairs: 3, time: 30 },
  medium: { pairs: 6, time: 60},
  hard: { pairs: 10, time: 120}
}

let currentDifficulty = difficulties.easy;

const themebtn = document.getElementById('theme-btn');
const powerbtn = document.getElementById('power-btn');
document.getElementById('start-btn').addEventListener("click", startGame);
document.getElementById('reset-btn').addEventListener("click", startGame);

document.querySelectorAll("[data-difficulty]").forEach(button => {
  button.addEventListener("click", () => {
    const level = button.dataset.difficulty;
    currentDifficulty = difficulties[level];

    const grid = document.getElementById("game_grid");
    grid.classList.remove("easy", "medium", "hard");
    grid.classList.add(level);
    startGame();
  });
});

async function fetchAllPokemonList() {
  const res = await fetch(`${"https://pokeapi.co/api/v2/pokemon"}?limit=1025`);
  const data = await res.json();
  return data.results;
}

async function fetchPokemonDetail(url) {
  const res = await fetch(url);
  const data = await res.json();
  const image =
    data.sprites?.other?.["official-artwork"]?.front_default ||
    data.sprites?.front_default ||
    null;
  console.log(data);
  return { name: data.name, image };
}

function shuffleArray(array) {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

async function generateCards() {
  const gameGrid = document.getElementById("game_grid");

  const pokemonList = await fetchAllPokemonList();

  const shuffledPokemon = shuffleArray(pokemonList);

  const selectedPokemon = shuffledPokemon.slice(0, currentDifficulty.pairs);

  const pokemonData = await Promise.all(
    selectedPokemon.map(pokemon =>
      fetchPokemonDetail(pokemon.url)
    )
  );

  const cardData = [...pokemonData, ...pokemonData];

  const shuffledCards = shuffleArray(cardData);

  gameGrid.innerHTML = "";

  shuffledCards.forEach((pokemon, index) => {
    gameGrid.innerHTML += `
      <div class="card">
        <img
          id="img${index}"
          class="front_face"
          src="${pokemon.image}"
          alt="${pokemon.name}"
        >

        <img
          class="back_face"
          src="back.webp"
          alt="back"
        >
      </div>
    `;
  });
}

function startTimer() {
  clearInterval(timerInterval);
  timeLeft = currentDifficulty.time;
  updateTimerUI();

  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerUI();

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      endGame();
    }
  }, 1000);
}

function endGame() {
  $(".card").off("click");
  alert("Time's up! Game Over.");
}

function updateTimerUI() {
  document.getElementById("timer").textContent = timeLeft;
}

themebtn.addEventListener('click', () => {
  const bg = document.getElementById('bg');

  bg.classList.toggle('dark-theme');
  bg.classList.toggle('light-theme');
});

powerbtn.addEventListener('click', () => {
  if (havePowerUp) {
    powerUp();
    havePowerUp = false;
  }
})

function powerUp() {
  $(".card").addClass("flip");

  setTimeout(() => {
    $(".card").removeClass("flip");
  }, 3000);
}

function updateClicks() {
  document.getElementById('clicks').textContent = clicks;
}

function updateMatched() {
  document.getElementById('matched').textContent = matchedPairs;
}

function updateRemaining() {
  document.getElementById('remaining').textContent = currentDifficulty.pairs - matchedPairs;
}

function setup() {
  let firstCard = undefined;
  let secondCard = undefined;
  let lockBoard = false;

  $(".card").on("click", function () {

    // prevent double clicking while waiting
    if (lockBoard) return;

    // prevent clicking same card twice
    if ($(this).hasClass("flip")) return;

    $(this).toggleClass("flip");

    clicks++;
    updateClicks();

    if (!firstCard) {

      firstCard = $(this).find(".front_face")[0];

    } else {

      secondCard = $(this).find(".front_face")[0];

      // MATCH
      if (firstCard.src === secondCard.src) {


        console.log("match");

        $(`#${firstCard.id}`).parent().off("click");
        $(`#${secondCard.id}`).parent().off("click");

        matchedPairs++;
        updateMatched();
        updateRemaining();

        if (matchedPairs === currentDifficulty.pairs) {

          setTimeout(() => {

            clearInterval(timerInterval);

            $(".card").off("click");

            alert("You win!");

          }, 500);
        }

        firstCard = undefined;
        secondCard = undefined;

      } else {

        console.log("no match");

        lockBoard = true;

        setTimeout(() => {

          $(`#${firstCard.id}`)
            .parent()
            .toggleClass("flip");

          $(`#${secondCard.id}`)
            .parent()
            .toggleClass("flip");

          firstCard = undefined;
          secondCard = undefined;

          lockBoard = false;

        }, 1000);
      }
    }
  });
}

async function startGame() {
  clicks = 0;
  matchedPairs = 0;
  totalPairs = currentDifficulty.pairs;
  timeLeft = 0;
  havePowerUp = true;
  document.getElementById('total').textContent = currentDifficulty.pairs;
  updateClicks();
  updateRemaining();
  updateMatched();

  clearInterval(timerInterval);

  $("#game_grid").empty();
  await generateCards();
  setup();
  startTimer();
}

$(document).ready(function () {
  startGame();
});