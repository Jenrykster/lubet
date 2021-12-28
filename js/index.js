let gamesRules;
let selectedGameRules;

/* 
let $lotofacilButton = document.querySelector('#lf-button');
let $megasenaButton = document.querySelector('#ms-button');
let $lotomaniaButton = document.querySelector('#lm-button');
*/

let gameTypeSelector = document.querySelector('#game-selector');

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
    }
}

function setupButtons(){
    const buttons = gameTypeSelector.children;
    for(let button of buttons){
        let game = button.dataset.type;
        let selectedGame = gamesRules.types.find(el => {
            return el.type == game;
        });

        button.style.color = selectedGame.color;
        button.style.border = `${selectedGame.color} 1px solid`;

        button.addEventListener('click', changeSelectedGame.bind(event, selectedGame));
    }
}

function changeSelectedGame(selectedGame, event){
    selectedGameRules = selectedGame;

    console.log(selectedGameRules);
}