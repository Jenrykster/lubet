let gamesRules;
let selectedGameRules;
let selectedNumbers = [];
let itemsOnCart = [];

const $buttonContainer = document.querySelector('#game-selector');

let $selectedGameText = document.querySelector('#selected-game-text');
let $gameDescription = document.querySelector('#description');
let $numberGrid = document.querySelector('#number-grid');

let $completeButton = document.querySelector('#complete');
let $clearButton = document.querySelector('#clear');

let $addToCart = document.querySelector('#cart-button');
let $emptyCartMessage = document.querySelector('#empty-cart');

let $cart = document.querySelector('#cart-items');
let $totalPrice = document.querySelector('#total');

init()

function init(){
    getRules();
}

function getRules(){
    const rulesRequest = new XMLHttpRequest();

    rulesRequest.open('get', 'https://jenrykster.github.io/lubet/data/games.json')

    rulesRequest.onreadystatechange = onRulesRequestUpdate;

    rulesRequest.send();
}

function onRulesRequestUpdate(event){
    let request = event.target;
    if(request.readyState == 4 && request.status == 200){
        let response = JSON.parse(request.responseText);
        gamesRules = response;

        setupButtons();
        changeSelectedGame(gamesRules.types[0], $buttonContainer.children[0]); // Define o jogo padrão quando a aplicação iniciar
        updateNumberGrid();
        updateCart();
    }
}

function setupButtons(){
    for(let game of gamesRules.types){
        let newButton = createButton(game);

        newButton.addEventListener('click', changeSelectedGame.bind(event, game)); 

        $buttonContainer.appendChild(newButton);

    }

    $completeButton.addEventListener('click', completeBet);
    $clearButton.addEventListener('click', updateNumberGrid);

    $addToCart.addEventListener('click', addNumbersToCart);
}

function createButton(game){
    let buttonToReturn = document.createElement('button');
    buttonToReturn.type = 'button';

    buttonToReturn.classList.add('button-selector');
    buttonToReturn.dataset.type = game.type;
    buttonToReturn.innerHTML = game.type;

    buttonToReturn.style.setProperty('--main-color', game.color);

    return buttonToReturn;
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
    for(let button of $buttonContainer.children){
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
    if(selectedNumbers.includes(parseInt(number.dataset.number))){
        number.classList.toggle('active');
        let id = selectedNumbers.findIndex(n => {
            return n == number.dataset.number;
        })
        selectedNumbers.splice(id, 1);
    }
    else if(selectedNumbers.length < selectedGameRules['max-number']){
        number.classList.toggle('active');
        selectedNumbers.push(parseInt(number.dataset.number));
    }else{
        alert('Quantidade máxima de números atingida');
    }
}

function completeBet(){
    let numbers = generateRandomNumbers();
    
    updateNumberGrid();

    for(let number of numbers){
        toggleNumberSelection($numberGrid.children.item(number-1));
    }
}

function generateRandomNumbers(){
    let numbersGenerated = selectedNumbers;
    const maxNumbers = selectedGameRules['max-number'];
    const range = selectedGameRules.range;

    for(let i = 1; numbersGenerated.length < maxNumbers; i++){
        let randomNumber = Math.floor(Math.random() * (range - 1)) + 1; // Previne que o número seja 0
        if(!numbersGenerated.includes(randomNumber) && randomNumber != 0){
            numbersGenerated.push(randomNumber);
        }
    }

    return numbersGenerated;
}

function addNumbersToCart(){
    selectedNumbers = selectedNumbers.sort((a,b)=> {
        return a-b;
    })

    let duplicate = isDuplicate(selectedNumbers);

    if(selectedNumbers.length != selectedGameRules['max-number']){
        let numbersMissing = selectedGameRules['max-number'] - selectedNumbers.length
        alert(`Escolha mais ${numbersMissing} ${numbersMissing > 1 ? 'números' : 'número'}!`);
    }
    else if(duplicate){
        alert('Você já fez essa aposta !');
    }
    else{
        let bet = {
            type: selectedGameRules.type,
            numbers: selectedNumbers,
            price: selectedGameRules.price,
            color: selectedGameRules.color,
        }
        itemsOnCart.push(bet);
        updateNumberGrid();
        updateCart();
    }
}

function updateCart(){
    let totalPrice = 0;

    $cart.innerHTML = ''; // Limpa o carrinho

    $emptyCartMessage.style.display = itemsOnCart.length == 0 ? 'flex' : 'none';

    for(let cartItem of itemsOnCart){
        $cart.appendChild(newCartElement(cartItem));
        totalPrice += cartItem.price;
    }

    $totalPrice.innerHTML = `<b><i>CART</i></b> TOTAL: ${formatREAL(totalPrice)}`;
}

function newCartElement(betData){
    let item = document.createElement('div');
    item.classList.add('cart-item-container');

    let deleteButton = document.createElement('span');
    deleteButton.innerHTML = 'delete';
    deleteButton.classList.add('material-icons');
    deleteButton.addEventListener('click', deleteSelfItem.bind(event, betData));

    let itemInfo = document.createElement('div');
    itemInfo.classList.add('cart-items');
    itemInfo.style.setProperty('--main-color', betData.color);

    let numbers = document.createElement('p');
    numbers.innerHTML = betData.numbers.join(', ');
    itemInfo.appendChild(numbers);

    let price = document.createElement('p');
    price.innerHTML = `<b class="bold">${betData.type}</b> ${formatREAL(betData.price)}`;
    itemInfo.appendChild(price);

    item.appendChild(deleteButton);
    item.appendChild(itemInfo);

    return item;
}

function deleteSelfItem(bet, event){
    let id = itemsOnCart.findIndex(item => {
        return item == bet;
    })
    itemsOnCart.splice(id, 1);
    updateCart();
}

function isDuplicate(numbers){
    return itemsOnCart.some(bet => {
        if(bet.type == selectedGameRules.type){
            let sameNumbers = bet.numbers.every((betNumber, index) => {
                return betNumber == numbers[index];
            })

            return sameNumbers;
        }  
    })
}

function formatREAL(value){
    return value.toLocaleString('pt-br',{style: 'currency', currency: 'BRL'});
}
