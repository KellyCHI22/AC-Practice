const GAME_STATE = {
    FirstCardAwaits: "FirstCardAwaits",
    SecondCardAwaits: "SecondCardAwaits",
    CardsMatchFailed: "CardsMatchFailed",
    CardsMatched: "CardsMatched",
    GameFinished: "GameFinished",
};

// 此處 Symbols 常數儲存的資料不會變動，因此習慣上將首字母大寫以表示此特性
const Symbols = [
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17989/__.png', // 黑桃
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17992/heart.png', // 愛心
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17991/diamonds.png', // 方塊
    'https://assets-lighthouse.alphacamp.co/uploads/image/file/17988/__.png' // 梅花
];

const view = {
    // 遊戲初始化時會透過 view.displayCards 直接呼叫
    getCardElement(index) {
        return `<div data-index="${index}" class="card back"></div>`;
    },
    // 使用者點擊時才由負責翻牌的函式來呼叫
    getCardContent(index) {
        const number = this.transformNumber((index % 13) + 1);
        const symbol = Symbols[Math.floor(index / 13)];
        return `
            <p>${number}</p>
            <img src="${symbol}" />
            <p>${number}</p>
        `;
    },
    // 若是 1、11、12、13 的狀況，則分別回傳 A、J、Q、K，如果數字是 2-10，則把數字原封不動地回傳
    transformNumber(number) {
        switch (number) {
            case 1:
                return 'A';
            case 11:
                return 'J';
            case 12:
                return 'Q';
            case 13:
                return 'K';
            default:
                return number;
        }
    },

    //當物件的屬性與函式/變數名稱相同時，可以省略不寫
    // 原本的寫法
    // const view = {
    // displayCards: function displayCards() { ...  }
    // }
    displayCards(indexes) {
        const rootElement = document.querySelector('#cards');
        rootElement.innerHTML = indexes.map(index => this.getCardElement(index)).join('');
        // 用 map 迭代陣列，並依序將數字丟進 view.getCardElement()，會變成有 52 張卡片的陣列；
        // 接著要用 join("") 把陣列合併成一個大字串，才能當成 HTML template 來使用；
        // 把組合好的 template 用 innerHTML 放進 #cards 元素裡。
    },
    flipCards(...cards) {
        cards.map(card => {
            if (card.classList.contains('back')) {
                card.classList.remove('back');
                card.innerHTML = this.getCardContent(Number(card.dataset.index));
                return;
            }
            card.classList.add('back');
            card.innerHTML = null;
        });
    },
    pairCards(...cards) {
        cards.map(card => {
            card.classList.add('paired');
        });
    },
    renderScore(score) {
        document.querySelector(".score").textContent = `Score: ${score}`;
    },
    renderTriedTimes(times) {
        document.querySelector(".tried").textContent = `You've tried: ${times} times`;
    },
    appendWrongAnimation(...cards) {
        cards.map(card => {
            card.classList.add('wrong');
            // 綁定「動畫結束事件 (animationend)」，一旦動畫跑完一輪，就把 .wrong 這個 class 拿掉。
            card.addEventListener('animationend', event => event.target.classList.remove('wrong'), { once: true });
            // {once: true} 是要求在事件執行一次之後，就要卸載這個監聽器。因為同一張卡片可能會被點錯好幾次，每一次都需要動態地掛上一個新的監聽器，並且用完就要卸載。
        });
    },
    showGameFinished() {
        const div = document.createElement('div');
        div.classList.add('completed');
        div.innerHTML = `
            <p>Complete!</p>
            <p>Score: ${model.score}</p>
            <p>You've tried: ${model.triedTimes} times</p>
        `;
        const header = document.querySelector('#header');
        header.before(div);
    }
};

const model = {
    score: 0,
    triedTimes: 0,
    revealedCards: [],
    isRevealedCardsMatched() {
        return this.revealedCards[0].dataset.index % 13 === this.revealedCards[1].dataset.index % 13;
    }
};



const controller = {
    currentState: GAME_STATE.FirstCardAwaits,
    generateCards() {
        view.displayCards(utility.getRandomNumberArray(52));
    },
    dispatchCardAction(card) {
        // 挑出「非牌背」的卡牌
        if (!card.classList.contains('back')) {
            return;
        }
        switch (this.currentState) {
            // 在 FirstCardAwaits 狀態點擊卡片的話，會將卡片翻開，然後進入 SecondCardAwaits 狀態
            case GAME_STATE.FirstCardAwaits:
                view.flipCards(card);
                model.revealedCards.push(card);
                this.currentState = GAME_STATE.SecondCardAwaits;
                break;
            // 在 SecondCardAwaits 狀態點擊卡片的話，會將卡片翻開，接著檢查翻開的兩張卡是否數字相同
            case GAME_STATE.SecondCardAwaits:
                // 只要切換至 SecondCardAwaits，嘗試次數就要 +1
                view.renderTriedTimes(++model.triedTimes);
                view.flipCards(card);
                model.revealedCards.push(card);
                // 判斷配對是否成功
                if (model.isRevealedCardsMatched()) {
                    // 配對成功
                    // 翻了兩張牌以後，如果配對成功，分數就要 +10
                    view.renderScore(model.score += 10);
                    this.currentState = GAME_STATE.CardsMatched;
                    // 只要不去呼叫 flipCard，卡片就會維持翻開
                    view.pairCards(...model.revealedCards);
                    model.revealedCards = [];
                    // 分數達到 260 分時遊戲結束並出現結束畫面
                    if (model.score === 260) {
                        console.log('showGameFinished');
                        this.currentState = GAME_STATE.GameFinished;
                        view.showGameFinished();  // 加在這裡
                        return;
                    }
                    this.currentState = GAME_STATE.FirstCardAwaits;
                } else {
                    // 配對失敗
                    this.currentState = GAME_STATE.CardsMatchFailed;
                    view.appendWrongAnimation(...model.revealedCards);
                    setTimeout(controller.resetCards, 1000);
                }
                break;
        }
        console.log('this.currentState', this.currentState);
        console.log('revealedCards', model.revealedCards.map(card => card.dataset.index));
    },
    resetCards() {
        view.flipCards(...model.revealedCards);
        model.revealedCards = [];
        controller.currentState = GAME_STATE.FirstCardAwaits;
    }
};

const utility = {
    getRandomNumberArray(count) {
        const number = Array.from(Array(count).keys());
        for (let index = number.length - 1; index > 0; index--) {
            let randomIndex = Math.floor(Math.random() * (index + 1))
                ;[number[index], number[randomIndex]] = [number[randomIndex], number[index]];
        }
        return number;
    }
};

controller.generateCards();
document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', event => {
        controller.dispatchCardAction(card);
    });
});