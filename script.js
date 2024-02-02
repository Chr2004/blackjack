// Eventlistener toevoegen voor het laden van de pagina
window.addEventListener('load', function () {
    // De main screen verbergen
    document.getElementById('main').style.display = 'none';

    // Splash screen laten zien
    document.getElementById('splash-screen').style.display = 'flex';
});

function startGame() {
    // Haalt het ingevulde bank saldo op uit de splashscreen
    const initialBankInput = document.getElementById('bank-input');
    const initialBankAmount = parseInt(initialBankInput.value);

    // Valideert de invoer voor het bank getal
    if (isNaN(initialBankAmount) || initialBankAmount <= 0) {
        alert("Please enter a valid bank amount.");
        return;
    }

    // Stelt de starterhoeveelheid in van de bank
    bank = initialBankAmount;
    document.getElementById('bank').textContent = `Bank: $${bank}`;
    document.getElementById('splash-screen').style.display = 'none';

    // Laat het spel zien
    document.getElementById('main').style.display = 'flex';
}
// Constanten voor de symbolen en waarden
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const ranks = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

// Arrays voor het kaartspel en de speler/dealer handen
let deck = [];
let playerHand = [];
let dealerHand = [];

// Variabelen voor de bank, inzet, en spelstatus
let bank;
let bet;
let isDealerSecondCardHidden = true;
let gameInProgress = false;

// Maakt het kaartspel
function createDeck() {
    for (let suit of suits) {
        for (let rank of ranks) {
            deck.push({ suit, rank });
        }
    }
}

// Schud het kaartspel
function shuffleDeck() {
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
}

// Valideert het ingevulde inzet bedrag
function validateBet() {
    let betInput = document.getElementById('bet-input');
    bet = parseInt(betInput.value);

    // Error melding wanneer ongeldig getal word ingevuld
    if (isNaN(bet) || bet <= 0 || bet > bank) {
        document.getElementById('bet-error-message').textContent = "Invalid bet amount";
        return false;
    }

    // Vorige errors weghalen
    document.getElementById('bet-error-message').textContent = '';

    return true;
}

function deal() {
    document.getElementById('result-message').textContent = '';
    if (!gameInProgress) {
        if (bank <= 0) {
            alert("Game over! You're out of money.");
            return;
        }

        if (!validateBet()) {
            return;
        }

        // Inzet van de bank afhalen
        bank -= bet;

        // Inzet box leeghalen
        document.getElementById('bet-input').value = '';

        deck = [];
        createDeck();
        shuffleDeck();

        playerHand = [drawCard(), drawCard()];
        dealerHand = [drawCard(), drawCard()];
        isDealerSecondCardHidden = true;
        gameInProgress = true;

        updateDisplay();

        // Knoppen aanzetten van hit en stand
        document.getElementById('hit-btn').disabled = false;
        document.getElementById('stand-btn').disabled = false;

        // Controleren of er blackjack is en als er blackjack is het spel eindigen
        if (calculateHandValue(playerHand) === 21 && playerHand.length === 2) {
            endGame("Blackjack! You win!");
            return;
        }

        if (calculateHandValue(dealerHand) === 21 && dealerHand.length === 2) {
            endGame("Dealer Blackjack! You lose.");
            return;
        }
    }
}


function drawCard() {
    return deck.pop();
}

//Scherm updaten met de kaarten 
function updateDisplay() {
    displayHand(playerHand, 'player-hand');
    displayHand(dealerHand, 'dealer-hand');

    document.getElementById('bank').textContent = `Bank: $${bank}`;
}

//Waarde van de handen berekenen
function calculateHandValue(hand) {
    let sum = 0;
    let hasAce = false;

    for (let i = 0; i < hand.length; i++) {
        const card = hand[i];

        if (card.rank === 'A') {
            hasAce = true;
            sum += 11;
        } else if (card.rank === 'K' || card.rank === 'Q' || card.rank === 'J') {
            sum += 10;
        } else {
            sum += parseInt(card.rank);
        }
    }

    // Als er een aas op tafel ligt en de score gaat over 21 de waarde van de aas aanpassen
    while (hasAce && sum > 21) {
        sum -= 10;
        hasAce = false; // Alleen voor alle azen 1 keer 10 eraf halen
    }

    return sum;
}

//Kaarten weergeven in het scherm
function displayHand(hand, elementId) {
    const handElement = document.getElementById(elementId);
    handElement.innerHTML = '';

    let totalValue = calculateHandValue(hand);
    let hasAce = false;

    hand.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');

        const cardImage = document.createElement('img');
        cardImage.src = isDealerSecondCardHidden && elementId === 'dealer-hand' && index === 1
            ? 'cards/facedown.png'  
            : `cards/${card.rank}_of_${card.suit.toLowerCase()}.png`; 
        cardImage.alt = `${card.rank} of ${card.suit}`;
        cardImage.style.width = '100px';
        cardImage.style.height = '160px';
        cardElement.appendChild(cardImage);

        handElement.appendChild(cardElement);

        if (!isDealerSecondCardHidden || (elementId === 'player-hand')) {
            if (card.rank === 'A' && totalValue > 21) {
                hasAce = true;
            }
        }
    });

    // Laat opgetelde waarde naast de kaarten zien
    const totalElement = document.createElement('div');
    totalElement.classList.add('total-value');

    // Waarde aanpassen als er een aas is en de waarde meer dan 21 is
    if (hasAce && totalValue > 21) {
        totalValue -= 10;
    }

    // Als de 2e kaart van de dealer nog verborgen is alleen de waarde van de eerste kaart laten zien
    totalElement.textContent = isDealerSecondCardHidden && elementId === 'dealer-hand'
        ? calculateHandValue([hand[0]])
        : totalValue;

    handElement.appendChild(totalElement);
}


function hit() {
    if (!gameInProgress) {
        return; // Niet meer door kunnen hitten als het spel afgelopen is
    }

    playerHand.push(drawCard());
    updateDisplay();

    if (calculateHandValue(playerHand) > 21) {
        endGame("You busted! Dealer wins.");
    }
}

function stand() {
    if (!gameInProgress) {
        return; // Niet meer kunnen standen als het spel afgelopen is
    }

    isDealerSecondCardHidden = false; // 2e kaart van de dealer laten zien

    while (calculateHandValue(dealerHand) < 17) {
        dealerHand.push(drawCard());
    }

    updateDisplay();

    if (calculateHandValue(dealerHand) > 21 || calculateHandValue(playerHand) > calculateHandValue(dealerHand)) {
        endGame("You win!");
    } else if (calculateHandValue(playerHand) < calculateHandValue(dealerHand)) {
        endGame("Dealer wins.");
    } else {
        endGame("It's a tie!");
    }
}


function endGame(message) {
    gameInProgress = false; // Spel eindigen
    isDealerSecondCardHidden = false; // 2e kaart dealer laten zien
    updateDisplay();

    // Resultaat bericht laden
    const resultMessageElement = document.getElementById('result-message');
    resultMessageElement.textContent = message;

    const isBlackjack = message.includes("Blackjack!");

    // Controleren of er blackjack is
    if (isBlackjack) {
        bank += 1.5 * bet; // Blackjack betaald 3:2
    } else {
        // Delay waarna resultaat melding word weggehaald
        setTimeout(() => {
            resultMessageElement.textContent = '';

            const isWin = message.includes("You win!");
            const isTie = message.includes("It's a tie!");

            if (isWin) {
                // Win verdubbeld inzet
                bank += 2 * bet;
            } else if (message.includes("Dealer wins.")) {
                // Als speler verliest gebeurt en niks want inzet is er al af
            } else if (isTie) {
                // Inzet terug wanneer gelijkspel
                bank += bet;
            }

            document.getElementById('bank').textContent = `Bank: $${bank}`;

            if (isWin || isTie) {
                isDealerSecondCardHidden = true; // 2e kaart weer verbergen voor nieuwe ronde
                deal();
            }
			document.getElementById('bet-error-message').textContent = '';
        }, 2000); // 2 seconden delay
    }
}

