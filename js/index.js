let gamesRules;
let selectedGameRules;

/* 
let $lotofacilButton = document.querySelector('#lf-button');
let $megasenaButton = document.querySelector('#ms-button');
let $lotomaniaButton = document.querySelector('#lm-button');
*/

let $gameTypeSelector = document.querySelector('#game-selector');

let $selectedGameText = document.querySelector('#selected-game-text');
let $gameDescription = document.querySelector('#description');
let $numberGrid = document.querySelector('#number-grid');

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
        changeSelectedGame(gamesRules.types[0]); // Define o jogo padrão quando a aplicação iniciar
        updateNumberGrid();
    }
}

function setupButtons(){
    const buttons = $gameTypeSelector.children;
    for(let button of buttons){
        let game = button.dataset.type;
        let selectedGame = gamesRules.types.find(el => {
            return el.type == game;
        });

        changeButtonColors(button, selectedGame.color);

        button.addEventListener('click', changeSelectedGame.bind(event, selectedGame));
    }
}

function changeSelectedGame(selectedGame, event){
    selectedGameRules = selectedGame;

    updateNumberGrid();
}

function changeButtonColors(button, color){
    button.style.setProperty('--main-color', color);
}

function updateNumberGrid(){
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

    element.addEventListener('mouseover', ev => {
        ev.target.style.backgroundColor = '#99A0C4';
        ev.target.style.cursor = 'pointer';
    })
    element.addEventListener('mouseleave', ev => {
        ev.target.style.backgroundColor = '#ADC0C4';
    })

    return element;
}