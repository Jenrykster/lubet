let gamesRules;
let selectedGameRules;
let selectedNumbers = [];
let $gameTypeSelector = document.querySelector('#game-selector');
const $buttons = $gameTypeSelector.children;

let $selectedGameText = document.querySelector('#selected-game-text');
let $gameDescription = document.querySelector('#description');
let $numberGrid = document.querySelector('#number-grid');

let $completeButton = document.querySelector('#complete');
let $clearButton = document.querySelector('#clear');

init()

function init(){
    getRules();
}

function getRules(){
    const rulesRequest = new XMLHttpRequest();

    rulesRequest.open('get', 'http://127.0.0.1:5500/data/games.json')

    rulesRequest.onreadystatechange = onRulesRequestUpdate;

    rulesRequest.send();
}

function onRulesRequestUpdate(event){
    let request = event.target;
    if(request.readyState == 4 && request.status == 200){
        let response = JSON.parse(request.responseText);
        gamesRules = response;

        setupButtons();
        changeSelectedGame(gamesRules.types[0], $buttons[0]); // Define o jogo padrão quando a aplicação iniciar
        updateNumberGrid();
    }
}

function setupButtons(){
    for(let button of $buttons){
        let game = button.dataset.type;
        let selectedGame = gamesRules.types.find(el => {
            return el.type == game;
        });

        changeButtonColors(button, selectedGame.color);

        button.addEventListener('click', changeSelectedGame.bind(event, selectedGame));
    }

    $completeButton.addEventListener('click', completeBet);
    $clearButton.addEventListener('click', updateNumberGrid);
}

function changeSelectedGame(selectedGame, event){
    changeActiveButton(event.target || event); // Send button element if it's not an event

    if(selectedGameRules != selectedGame){
        selectedGameRules = selectedGame;
        updateNumberGrid();
    }else{
        return;
    }
    
}
function changeActiveButton(button){

    for(let button of $buttons){
        button.classList.remove('active');
    }
    button.classList.add('active');
}
function changeButtonColors(button, color){
    button.style.setProperty('--main-color', color);
}

function updateNumberGrid(){
    selectedNumbers = [];
    $selectedGameText.innerHTML = `<i><b>NEW BET</b> FOR ${selectedGameRules.type.toUpperCase()}</i>`;
    $gameDescription.innerHTML = selectedGameRules.description;
    $numberGrid.innerHTML = '';

    generateGridNumbers(selectedGameRules.range);
}

function generateGridNumbers(maxNumber){
    for(let i = 1; i <= maxNumber; i++){
        let actualNumberEl = createSelectableNumber(i);
        $numberGrid.appendChild(actualNumberEl);
    }
}

function createSelectableNumber(number){
    let element = document.createElement('div');
    let numberText = number.toString().padStart(2, '0');

    element.classList.add('circle-text');
    element.dataset.number = number;
    element.innerHTML = numberText;
    
    element.style.setProperty('--main-color', selectedGameRules.color);

    element.addEventListener('click', toggleNumberSelection.bind(event, element));

    return element;
}

function toggleNumberSelection(number, event){
    console.log(selectedNumbers);
    if(selectedNumbers.length < selectedGameRules['max-number']){
        number.classList.toggle('active');
        selectedNumbers.push(number.dataset.number);
    }else{
        alert('Quantidade máxima de números atingida');
    }
}

function completeBet(){
    let numbers = selectedNumbers.concat(generateRandomNumbers());
     
    updateNumberGrid();
    for(let number of numbers){
        toggleNumberSelection($numberGrid.children.item(number-1));
    }
}

function generateRandomNumbers(){
    let numbersGenerated = [];
    const maxNumbers = selectedGameRules['max-number'] - selectedNumbers.length;
    const range = selectedGameRules.range;

    for(let i = 1; numbersGenerated.length < maxNumbers; i++){
        let randomNumber = Math.floor(Math.random() * (range - 1)) + 1; // Previne que o número seja 0
        if(!numbersGenerated.includes(randomNumber) && randomNumber != 0){
            numbersGenerated.push(randomNumber);
        }
    }

    return numbersGenerated;
}