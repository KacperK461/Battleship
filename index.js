"use strict";

let game = {
    userBoard: [], 
    opponentBoard: [],

    userShips: {},
    opponentShips: {},
    
    setGame(data) {
        if(data)
        {
            this.userBoard = data.user.board;
            this.userShips = data.user.ships;
            this.opponentBoard = data.opponent.board;
            this.opponentShips = data.opponent.ships;
            this.gameStatus = data.status;
            this.userTurn = data.userTurn;
        }
        else
        {
            this.gameStatus = 1;
            this.userTurn = Math.round(Math.random()) === 0 ? true : false;
            this.userShips = {};
            this.opponentShips = {};
            for(let i = 0; i < 10; i++) {
                this.userBoard[i] = [];
                this.opponentBoard[i] = [];
                for(let j = 0; j < 10; j++){
                    this.userBoard[i][j] = 0;
                    this.opponentBoard[i][j] = 2;
                }
            }
        }
    },
        
    addShip: class {
        counter = 0;

        done = new Promise(resolve => {
            this.endIt = resolve;                 
        })

        constructor(board, size){
            this.board = board;
            this.size = size;
            this.shipContainer = board === game.userBoard ? game.userShips : game.opponentShips;
            this.setGoodFields(game.checkFillability, this.size);
        }

        setGoodFields(callback, value) {
            this.goodFields = this.board.map((row, rowIndex) => row.map((field, colIndex) => {
                if(field !== 0)
                    return 0;
                else
                    return callback(this.board, rowIndex, colIndex, value) ? 1 : 0;
            }))
        }

        addField(rowIndex, colIndex) {
            if(this.counter === 0 && this.goodFields[rowIndex][colIndex] === 1) {
                this.board[rowIndex][colIndex] = 'ship';
                this.counter++;
                this.checkIfEnds();
                this.setGoodFields(game.checkIfClose, 'ship');
                delete this.cantRemove;
            }  
            else if(this.counter < this.size && this.board[rowIndex][colIndex] === 0 && game.checkIfClose(this.board, rowIndex, colIndex, 'ship')) {
                this.board[rowIndex][colIndex] = 'ship';
                this.counter++;
                this.checkIfEnds();
                this.setGoodFields(game.checkIfClose, 'ship');
                delete this.cantRemove;
            }
        }

        removeField(rowIndex, colIndex) {
            if(this.board[rowIndex][colIndex] === 'ship') { 
                this.cantRemove = [];
                this.board[rowIndex][colIndex] = 0;
                let canRemove = true;
                this.cantRemove = this.board.map((row, rowIndex) => row.map((value, colIndex) => { 
                    if(this.counter <= 2 || value !== 'ship' || game.checkIfClose(this.board, rowIndex, colIndex, 'ship')) 
                        return 0;
                    else {
                        canRemove = false;
                        return 1;
                    }               
                }));
                if(!canRemove) 
                    this.board[rowIndex][colIndex] = 'ship';
                else {
                    this.counter--; 
                    if(this.counter === 0)
                        this.setGoodFields(game.checkFillability, this.size);
                    else
                        this.setGoodFields(game.checkIfClose, 'ship');
                }                   
            }         
        }

        checkIfEnds() {
            if(this.counter === this.size) {
                this.shipContainer[Object.keys(this.shipContainer).reduce((newKey, key) => { 
                    if(key === this.size.toString())
                        return `${key}_2`;
                    else if(newKey === key)
                        return `${newKey.slice(0,2)}${Math.round(newKey.slice(2)) + 1}`;
                    else return newKey;
                }, this.size)] = this.board.reduce((indexes, row, rowIndex) => row.reduce((indexes, value, colIndex) => {
                    if(value === 'ship')  
                        indexes.push([rowIndex, colIndex]);
                    return indexes;               
                }, indexes), []);

                game.changeFields(this.board, 'ship', 1);
                game.surround(this.board, 1, 2);
                this.endIt(true);
            }
        }
    },

    checkFillability(board, rowIndex, colIndex, size) {
        let counter = 1;
        let arr = [];
        for(let i = 0; i < board.length; i++) {
            arr[i] = board[i].slice();
        }
        arr[rowIndex][colIndex] = 'checked';
        const doCheckFillability = (rowIndex, colIndex) => { 
            if(counter === size)
                return true;
            else {           
                if(arr[rowIndex + 1] && arr[rowIndex + 1][colIndex] === 0)
                {
                    counter++;
                    arr[rowIndex + 1][colIndex] = 'checked';
                    doCheckFillability(rowIndex + 1, colIndex);
                    if(counter === size)
                        return true;
                }            
                if(arr[rowIndex][colIndex + 1] === 0)
                {
                    counter++;
                    arr[rowIndex][colIndex + 1] = 'checked';
                    doCheckFillability(rowIndex, colIndex + 1);
                    if(counter === size)
                        return true;
                }
                if(arr[rowIndex - 1] && arr[rowIndex - 1][colIndex] === 0)
                {
                    counter++;
                    arr[rowIndex - 1][colIndex] = 'checked';
                    doCheckFillability(rowIndex - 1, colIndex);
                    if(counter === size)
                        return true;
                }
                if(arr[rowIndex][colIndex - 1] === 0)
                {
                    counter++;
                    arr[rowIndex][colIndex - 1] = 'checked';
                    doCheckFillability(rowIndex, colIndex - 1);
                    if(counter === size)
                        return true;
                }
                if(arr[rowIndex + 1] && arr[rowIndex + 1][colIndex + 1] === 0)
                {
                    counter++;
                    arr[rowIndex + 1][colIndex + 1] = 'checked';
                    doCheckFillability(rowIndex + 1, colIndex + 1);
                    if(counter === size)
                        return true;
                }
                if(arr[rowIndex + 1] && arr[rowIndex + 1][colIndex - 1] === 0)
                {
                    counter++;
                    arr[rowIndex + 1][colIndex - 1] = 'checked';
                    doCheckFillability(rowIndex + 1, colIndex - 1);
                    if(counter === size)
                        return true;
                } 
                if(arr[rowIndex - 1] && arr[rowIndex - 1][colIndex + 1] === 0)
                {
                    counter++;
                    arr[rowIndex - 1][colIndex + 1] = 'checked';
                    doCheckFillability(rowIndex - 1, colIndex + 1);
                    if(counter === size)
                        return true;
                }
                if(arr[rowIndex - 1] && arr[rowIndex - 1][colIndex - 1] === 0)
                {
                    counter++;
                    arr[rowIndex - 1][colIndex - 1] = 'checked';
                    doCheckFillability(rowIndex - 1, colIndex - 1);
                    if(counter === size)
                        return true;
                }      
            }
            return false;
        }
        return doCheckFillability(rowIndex, colIndex);
    },

    checkIfClose(board, rowIndex, colIndex, value) {
        if((board[rowIndex - 1] ? board[rowIndex - 1][colIndex] === value : false) ||
           (board[rowIndex + 1] ? board[rowIndex + 1][colIndex] === value : false) ||
           board[rowIndex][colIndex - 1] === value || board[rowIndex][colIndex + 1] === value ||
           (board[rowIndex - 1] ? board[rowIndex - 1][colIndex - 1] === value : false) ||
           (board[rowIndex - 1] ? board[rowIndex - 1][colIndex + 1] === value : false) ||
           (board[rowIndex + 1] ? board[rowIndex + 1][colIndex - 1] === value : false) ||
           (board[rowIndex + 1] ? board[rowIndex + 1][colIndex + 1] === value : false) 
        )
            return true;
        else
            return false;
    },

    changeFields(board, firstValue, nextValue) {
        board.forEach((row, rowIndex, array) => row.forEach((field, colIndex) => {
            if(field === firstValue)
                array[rowIndex][colIndex] = nextValue;
        }));
    },

    surround(board, surroundedValue, surroundingValue) {
        board.forEach((row, rowIndex, array) => row.forEach((field, colIndex) => {
            if(field !== surroundedValue && this.checkIfClose(board, rowIndex, colIndex, surroundedValue))
                array[rowIndex][colIndex] = surroundingValue;
        }));
    },

    removeShip(board, rowIndex, colIndex) {
        let shipContainer = board === this.userBoard ? this.userShips : this.opponentShips;   
        const shipIndex = this.getShipIndex(shipContainer, rowIndex, colIndex);
        for(let index of shipContainer[shipIndex]) 
            board[index[0]][index[1]] = 0;
        delete shipContainer[shipIndex];      
        this.changeFields(board, 2, 0);
        this.surround(board, 1, 2);     
    },

    getShipIndex(shipContainer, rowIndex, colIndex) {
        for(let [key, indexes] of Object.entries(shipContainer)) {
            for(let index of indexes) 
                if(index[0] === rowIndex && index[1] === colIndex)
                    return key;
        }
    },

    iterate(callback, board) {
        board.forEach((row, rowIndex, array) => row.forEach((field, colIndex) => {
            callback(field, rowIndex, colIndex, array, row);
        }));
    },

    checkIfEmpty(board) {
        let isEmpty = true;
        game.iterate((field) => {
            if(field !== undefined && field !== 0)
                isEmpty = false;
        }, board);
        return isEmpty;
    },

    fullfillBoard(board, ...shipsSizes) {
        const add = () => {
            const rowIndex = getRandomInt(0,9);
            const colIndex = getRandomInt(0,9);
            if(this.ship.goodFields[rowIndex][colIndex] === 1)
                this.ship.addField(rowIndex, colIndex);
            else 
                add();
        }
      
        for(let size of shipsSizes) {
            this.ship = new this.addShip(board, size);
            if(!this.checkIfEmpty(game.ship.goodFields)) {
                for(let i = size; i > 0; i--) {
                    add();
                }
                delete this.ship;
            }
            else {
                for(let i = 0; i < 10; i++) {
                    for(let j = 0; j < 10; j++){
                        board[i][j] = 0;
                    }
                }
                delete this.ship;
                this.fullfillBoard(board, ...shipsSizes);
                break;
            }
        }       
    }
}

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const setLocalStorage = (userHitShips = [], opponentHitShips = []) => {
    if(game.checkIfEmpty(game.userBoard))
        localStorage.removeItem('game');
    else {
        const data = {
            user: {
                board: game.userBoard,
                ships: game.userShips
            },
            opponent: { 
                board: game.opponentBoard,
                ships: game.opponentShips
            },
            status: game.gameStatus,
            userTurn: game.userTurn,
            userHitShips,
            opponentHitShips
        }
        localStorage.setItem('game', JSON.stringify(data));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const opponentBoard = document.querySelector('#board2');
    const clues = document.querySelector('#clues');
    const userFields = document.querySelectorAll('div[id^=user-box]');
    const opponentFields = document.querySelectorAll('div[id^=box]');
    let shipAdders = document.querySelectorAll('button[id^=ship-]'); 
    const info = document.querySelector('#info');
    const message = document.querySelector('#message');
    const gif = document.querySelector('#gif');
    const renewBtn = document.querySelector('#renewBtn');

    let userFieldsBoard = [[],[],[],[],[],[],[],[],[],[]];
    let opponentFieldsBoard = [[],[],[],[],[],[],[],[],[],[]];
        
    for(let field of userFields) {
        const rowIndex = field.id.charAt(9) ? Math.round(field.id.charAt(8)) : 0;
        const colIndex = field.id.charAt(9) ? Math.round(field.id.charAt(9)) : Math.round(field.id.charAt(8));
        userFieldsBoard[rowIndex][colIndex] = field;
    }

    for(let field of opponentFields) {
        const rowIndex = field.id.charAt(4) ? Math.round(field.id.charAt(3)) : 0;
        const colIndex = field.id.charAt(4) ? Math.round(field.id.charAt(4)) : Math.round(field.id.charAt(3));
        opponentFieldsBoard[rowIndex][colIndex] = field;
    }

    checkGameStatus().then(async () => {      
        const setDefault = () => {
            localStorage.removeItem('game');
            game.setGame();
            renderBoard(game.userBoard, userFieldsBoard)
            document.querySelector(`#ship-count-5`).innerText = 1;
            document.querySelector(`#ship-count-4`).innerText = 2;
            document.querySelector(`#ship-count-3`).innerText = 2;
            document.querySelector(`#ship-count-2`).innerText = 3;
            document.querySelector(`#ship-count-1`).innerText = 3;
            for(let adder of shipAdders) {
                adder.removeAttribute('disabled');
                adder.removeAttribute('done');
            }
        }

        while(true) {
            if(game.gameStatus === 1) {
                await addUserShips();      
                game.gameStatus = 2;
                setLocalStorage();
            }
            await play().catch(() => setDefault());
            if(!localStorage.getItem('game'))
                continue; 
            await end().then(() => setDefault());
        }
    });

    const addUserShips = () => {
        return new Promise(resolve => {       
            const shipRemover = {
                remover: document.querySelector('#remover'),
                active: false,
                canRemove: false,
                clicked: false,
                setRemover() {
                    if(this.active) {
                        this.remover.removeAttribute('disabled')
                        if(this.clicked) {
                            this.remover.classList.add('btn--clicked')
                            this.canRemove = true;
                        }
                        else {
                            this.remover.classList.remove('btn--clicked');
                            this.canRemove = false;
                        }               
                    }
                    else {
                        this.remover.setAttribute('disabled', true); 
                        this.remover.classList.remove('btn--clicked')
                        this.canRemove = false;
                    }
                }
            }; 
        
            shipRemover.remover.addEventListener('click', () => {
                shipRemover.clicked = !shipRemover.clicked;
                shipRemover.setRemover();
                renderBoard(game.userBoard, userFieldsBoard, true, shipRemover.clicked);   
            });

            if(Object.entries(game.userShips)[0]) {
                shipRemover.active = true;
                shipRemover.setRemover();
            }
            else {
                shipRemover.active = false;
                shipRemover.setRemover();
            }
    
            opponentBoard.style.display = 'none';
            clues.style.display = 'block';
            info.style.display = 'none';

            const counters = document.querySelectorAll('[id^=ship-count-]');
            for(let counter of counters) {
                for(let [key] of Object.entries(game.userShips)) {
                    if(key.charAt(0) === counter.id.charAt(11))
                        counter.innerText = Math.round(counter.innerText) - 1;                        
                }
            }         

            for(let adder of shipAdders) {
                const shipSize = Math.round(adder.id.charAt(5));
                        
                if(document.querySelector(`#ship-count-${shipSize}`).innerText === '0') {
                    adder.setAttribute('disabled', true); 
                    adder.setAttribute('done', 'true');                           
                }

                let clicked = false;
    
                adder.addEventListener('click', () => {       
                    if(!clicked) {
                        clicked = true;
    
                        adder.classList.add('btn--clicked'); 
                        for(let button of shipAdders) {
                            if(Math.round(button.id.charAt(5)) !== shipSize)
                                button.setAttribute('disabled', true);                                           
                        } 
    
                        shipRemover.clicked = false;
                        shipRemover.active = false;
                        shipRemover.setRemover();
    
                        game.ship = new game.addShip(game.userBoard, shipSize);
                        game.ship.done.then(() => {
                            clicked = false;
    
                            adder.classList.remove('btn--clicked');  
                            for(let button of shipAdders) {                                                  
                                if(button.getAttribute('done') !== 'true')                 
                                    button.removeAttribute('disabled');  
                            }
    
                            shipRemover.active = true;
                            shipRemover.setRemover();
    
                            delete game.ship;
                        
                            const shipCounter = document.querySelector(`#ship-count-${shipSize}`);
                            shipCounter.innerText = Math.round(shipCounter.innerText) - 1;
                            if(shipCounter.innerText === '0') {
                                adder.setAttribute('disabled', true); 
                                adder.setAttribute('done', 'true');
                            }
                            setLocalStorage();
    
                            let allShipsReady = true;
                            for(let counter of counters) {
                                if(counter.innerText !== '0')
                                    allShipsReady = false;
                            }
                            if(allShipsReady) {
                                for(let field of userFields) {
                                    field.removeEventListener('click', clickFunc);
                                    field.removeEventListener('contextmenu', contextmenuFunc);
                                    field.removeEventListener('mouseover', mouseoverFunc);
                                    field.removeEventListener('mouseout', mouseoutFunc);
                                } 
                                for(let button of shipAdders) {
                                    button.replaceWith(button.cloneNode(true));
                                }
                                shipAdders = document.querySelectorAll('button[id^=ship-]'); 
                                shipRemover.remover.replaceWith(shipRemover.remover.cloneNode(true));
                                game.fullfillBoard(game.opponentBoard, 5, 4, 4, 3, 3, 2, 2, 2, 1, 1, 1);
                                game.changeFields(game.userBoard, 2, 0);
                                game.changeFields(game.opponentBoard, 2, 0);
                                resolve();
                            }
                        })
                        renderBoard(game.userBoard, userFieldsBoard);
                    }
                    else {
                        clicked = false;
    
                        adder.classList.remove('btn--clicked');
                        for(let button of shipAdders) { 
                            if(button.getAttribute('done') !== 'true') {                   
                                button.removeAttribute('disabled');  
                            }
                        }
                              
                        if(Object.entries(game.userShips)[0]) {
                            shipRemover.active = true;
                            shipRemover.setRemover();
                        }
    
                        game.changeFields(game.userBoard, 'ship', 0);
                        delete game.ship;
                        renderBoard(game.userBoard, userFieldsBoard);
                    }             
                });
            } 

            const clickFunc = ({target}) => {
                const rowIndex = target.id.charAt(9) ? Math.round(target.id.charAt(8)) : 0;
                const colIndex = target.id.charAt(9) ? Math.round(target.id.charAt(9)) : Math.round(target.id.charAt(8));

                if(game.ship) {              
                    game.ship.addField(rowIndex, colIndex);        
                }
                if(shipRemover.canRemove && game.userBoard[rowIndex][colIndex] === 1) {
                    const shipIndex = game.getShipIndex(game.userShips, rowIndex, colIndex).charAt(0);
                    const shipCounter = document.querySelector(`#ship-count-${shipIndex}`);
                    shipCounter.innerText = Math.round(shipCounter.innerText) + 1;
                    const shipAdder = document.querySelector(`#ship-${shipIndex}`);
                    shipAdder.removeAttribute('disabled');
                    shipAdder.setAttribute('done', 'false');
                    for(let [row, col] of game.userShips[game.getShipIndex(game.userShips, rowIndex, colIndex)]) 
                        userFieldsBoard[row][col].classList.remove('board__box--remove-hover');               
                    game.removeShip(game.userBoard, rowIndex, colIndex);
                    if(Object.entries(game.userShips).length === 0) 
                        shipRemover.active = false;
                    shipRemover.setRemover();
                    setLocalStorage();
                } 
                renderBoard(game.userBoard, userFieldsBoard, true, shipRemover.clicked);                
            }

           const contextmenuFunc = (event) => {
                const rowIndex = event.target.id.charAt(9) ? Math.round(event.target.id.charAt(8)) : 0;
                const colIndex = event.target.id.charAt(9) ? Math.round(event.target.id.charAt(9)) : Math.round(event.target.id.charAt(8));

                event.preventDefault();
                if(game.ship) {
                    game.ship.removeField(rowIndex,colIndex);
                    renderBoard(game.userBoard, userFieldsBoard);
                }
           }

           const mouseoverFunc = ({target}) => {
                const rowIndex = target.id.charAt(9) ? Math.round(target.id.charAt(8)) : 0;
                const colIndex = target.id.charAt(9) ? Math.round(target.id.charAt(9)) : Math.round(target.id.charAt(8));

                if(game.userBoard[rowIndex][colIndex] === 1 && shipRemover.clicked) {
                    for(let [row, col] of game.userShips[game.getShipIndex(game.userShips, rowIndex, colIndex)]) 
                        userFieldsBoard[row][col].classList.add('board__box--remove-hover');
                }    
           }

           const mouseoutFunc = ({target}) => {
                const rowIndex = target.id.charAt(9) ? Math.round(target.id.charAt(8)) : 0;
                const colIndex = target.id.charAt(9) ? Math.round(target.id.charAt(9)) : Math.round(target.id.charAt(8));

                if(game.userBoard[rowIndex][colIndex] === 1 && shipRemover.clicked) {
                    for(let [row, col] of game.userShips[game.getShipIndex(game.userShips, rowIndex, colIndex)]) 
                        userFieldsBoard[row][col].classList.remove('board__box--remove-hover');
                }   
           }
           
            for(let field of userFields) {  
                field.addEventListener('click', clickFunc);
                field.addEventListener('contextmenu', contextmenuFunc);       
                field.addEventListener('mouseover', mouseoverFunc);       
                field.addEventListener('mouseout', mouseoutFunc);
            }

            renderBoard(game.userBoard, userFieldsBoard);
        });
    }

    const play = () => {
        return new Promise((resolve, reject) => {
            opponentBoard.removeAttribute('style');
            info.removeAttribute('style');
            clues.style.display = 'none';
            
            renderBoard(game.userBoard, userFieldsBoard);
            renderBoard(game.opponentBoard, opponentFieldsBoard, false);

            let userHitShips = JSON.parse(localStorage.getItem('game')).userHitShips;
            let opponentHitShips = JSON.parse(localStorage.getItem('game')).opponentHitShips;

            let canEnd = true;

            const userMove = ({target}) => {
                if(game.userTurn) {
                    const rowIndex = target.id.charAt(4) ? Math.round(target.id.charAt(3)) : 0;
                    const colIndex = target.id.charAt(4) ? Math.round(target.id.charAt(4)) : Math.round(target.id.charAt(3));

                    if(game.opponentBoard[rowIndex][colIndex] === 1) {
                        message.innerText = "Trafiony!!!";

                        game.opponentBoard[rowIndex][colIndex] = 3;
                        renderBoard(game.opponentBoard, opponentFieldsBoard, false);

                        const ship = game.getShipIndex(game.opponentShips, rowIndex, colIndex);
  
                        let canPush = true;
                        
                        for(let hitShip of userHitShips) {
                            if(hitShip && hitShip[0] === ship)
                                canPush = false;
                        }

                        if(canPush) {
                            userHitShips.push([ship, Math.round(ship.charAt(0))]);
                        }

                        for(let hitShip of userHitShips) {
                            if(hitShip[0] === ship)
                                hitShip[1]--;
                            if(hitShip[1] === 0) { 
                                message.innerText = "Trafiony, zatopiony!!!";
                                for(let [row, col] of game.opponentShips[ship]) {
                                    game.opponentBoard[row][col] = 5;
                                }
                                game.surround(game.opponentBoard, 5, 4);
                                for(let [row, col] of game.opponentShips[ship]) {
                                    game.opponentBoard[row][col] = 3;
                                }
                                delete game.opponentShips[ship];
                                userHitShips = userHitShips.filter(element => element[1] !== 0);                                
                                renderBoard(game.opponentBoard, opponentFieldsBoard, false);
                                checkIfEnds();
                            }
                        };
                       setLocalStorage(userHitShips, opponentHitShips);
                    }
                    else if(game.opponentBoard[rowIndex][colIndex] === 0) {
                        game.opponentBoard[rowIndex][colIndex] = 4;
                        game.userTurn = false;
                        message.innerText = "Pudło";
                        setTimeout(() => {
                            message.innerText = "Ruch przeciwnika";
                            gif.style.display = 'block'; 
                            canEnd = new Promise(resolve => setTimeout(() => opponentMove().then(() => {    
                                canEnd = true;
                                resolve();
                            }), 1000));                          
                        }, 1000);
                        renderBoard(game.opponentBoard, opponentFieldsBoard, false);
                        setLocalStorage(userHitShips, opponentHitShips);                        
                    }
                }
            }

            const opponentMove = async () => {
                const checkIfSunk = () => {
                    if(opponentHitShips[1] === 0) {
                        game.surround(game.userBoard, 3, 4);
                        delete game.userShips[opponentHitShips[0]];
                        opponentHitShips = [];
                        renderBoard(game.userBoard, userFieldsBoard);
                        message.innerText = "Trafiony, zatopiony!!!";
                        gif.style.display = 'block';
                        setLocalStorage(userHitShips, opponentHitShips);
                        if(checkIfEnds()) 
                            return true;
                        else
                            return false;
                    }
                    renderBoard(game.userBoard, userFieldsBoard);
                    return false;
                }

                const sleep = (ms) => {
                    return new Promise(resolve => setTimeout(resolve, ms));
                }

                const callMe = async () => {
                    await sleep(2000);
                    return await opponentMove();
                }

                const changeTurn = async () => {
                    await sleep(1000);
                    game.userTurn = true;
                    setLocalStorage(userHitShips, opponentHitShips);
                    message.innerText = "Twój ruch"; 
                    return await Promise.resolve();         
                }

                let rowIndex = getRandomInt(0, 9);
                let colIndex = getRandomInt(0, 9);

                if(!opponentHitShips[0]) {
                    if(game.userBoard[rowIndex][colIndex] === 1) {
                        const ship = game.getShipIndex(game.userShips, rowIndex, colIndex);
                        opponentHitShips[0] = ship;
                        opponentHitShips[1] = Math.round(ship.charAt(0)) - 1;
                        game.userBoard[rowIndex][colIndex] = 3;
                        setLocalStorage(userHitShips, opponentHitShips);
                        message.innerText = "Trafiony!!!"; 
                        gif.style.display = 'block';
                        if(checkIfSunk())
                            return await Promise.resolve();
                        else         
                            return await callMe();
                    }
                    else if(game.userBoard[rowIndex][colIndex] === 0) {
                        game.userBoard[rowIndex][colIndex] = 4;
                        setLocalStorage(userHitShips, opponentHitShips);
                        renderBoard(game.userBoard, userFieldsBoard);
                        message.innerText = "Pudło";
                        gif.style.display = 'none';
                        return await changeTurn();
                    }
                    else 
                        return await opponentMove();
                }
                else {
                    if(game.checkIfClose(game.userBoard, rowIndex, colIndex, 3)) {
                        if(game.userBoard[rowIndex][colIndex] === 1) {
                            opponentHitShips[1]--;
                            game.userBoard[rowIndex][colIndex] = 3;
                            setLocalStorage(userHitShips, opponentHitShips);
                            message.innerText = "Trafiony!!!";
                            gif.style.display = 'block';        
                            if(checkIfSunk())
                                return await Promise.resolve();
                            else         
                                return await callMe();
                        }
                        else if(game.userBoard[rowIndex][colIndex] === 0) {
                            game.userBoard[rowIndex][colIndex] = 4;
                            setLocalStorage(userHitShips, opponentHitShips);
                            renderBoard(game.userBoard, userFieldsBoard)  
                            message.innerText = "Pudło";  
                            gif.style.display = 'none';
                            return await changeTurn();                   
                        }
                        else 
                            return await opponentMove();
                    }
                    else 
                        return await opponentMove();                   
                }               
            };

            const renew = ({target}) => {
                for(let field of opponentFields) {
                    field.removeEventListener('click', userMove);
                }
                target.removeEventListener('click', renew);
                if(canEnd === true)
                    reject();
                else 
                    canEnd.then(() => reject());
            }
            
            const checkIfEnds = () => {
                if(!Object.entries(game.userShips)[0]) {
                    message.innerHTML = "Przegrana &#128543;";
                    gif.style.display = 'none';
                    renewBtn.removeEventListener('click', renew);
                    for(let field of opponentFields) {
                        field.removeEventListener('click', userMove);
                    }
                    resolve();
                    return true;
                }
                else if(!Object.entries(game.opponentShips)[0]) {
                    message.innerHTML = "Zwycięstwo &#128512;";
                    gif.style.display = 'none';
                    renewBtn.removeEventListener('click', renew);
                    for(let field of opponentFields) {
                        field.removeEventListener('click', userMove);
                    }
                    resolve();
                    return true;
                }
                return false;
            }
            
            if(game.userTurn) {
                message.innerText = "Twój ruch";
            }
            else {
                message.innerText = "Ruch przeciwnika";
                gif.style.display = 'block';

                canEnd = new Promise(resolve => setTimeout(() => opponentMove().then(() => {    
                    canEnd = true;
                    resolve();
                }), 2000));  
            }

            for(let field of opponentFields) {
                field.addEventListener('click', userMove);
            }

            renewBtn.addEventListener('click', renew);
        });
    }
    
    const end = () => {
        return new Promise(resolve => {
            const renew = ({target}) => {
                target.removeEventListener('click', renew);
                resolve();
            }
            renewBtn.addEventListener('click', renew);
        });
    }
});

const renderBoard = (board, elements, full = true, clicked) => {
    for(let i = 0; i < 10; i++) {
        for(let j = 0; j < 10; j++) {
            elements[i][j].removeAttribute('class');
            elements[i][j].classList.add('box', 'board__box');

            if(board[i][j] === 3)
                elements[i][j].classList.add('board__box--hit');
            if(board[i][j] === 4)
                elements[i][j].classList.add('board__box--free-space');

            if(full) {
                if(board[i][j] !== 0) {
                    if(board[i][j] === 1 || board[i][j] === 'ship') {                  
                        elements[i][j].classList.add('board__box--ship');
                        if(game.ship && game.ship.cantRemove && game.ship.cantRemove[i][j] === 1)
                            elements[i][j].classList.add('board__box--red');
                        if(clicked)
                            elements[i][j].classList.add('board__box--remove');
                    }
                    else if(board[i][j] === 2){
                        elements[i][j].classList.add('board__box--free-space');  
                    }       
                }
                else {
                    if(game.ship && game.ship.goodFields[i][j] === 1) {                          
                        elements[i][j].classList.add('board__box--green');
                        
                        if(game.ship.counter === 0)
                        {
                            let top = false;
                            let bottom = false;
                            let left = false;
                            let right = false;
                                            
                            if(!game.ship.goodFields[i - 1])                       
                                top = true;                   
                            if(game.ship.goodFields[i - 1] ? game.ship.goodFields[i - 1][j] !== 1 : false)
                                top = true; 
                            if(!game.ship.goodFields[i + 1])
                                bottom = true; 
                            if(game.ship.goodFields[i + 1] ? game.ship.goodFields[i + 1][j] !== 1 : false)
                            bottom = true; 
                            if(!game.ship.goodFields[i][j - 1] || game.ship.goodFields[i][j - 1] !==1)
                                left = true; 
                            if(!game.ship.goodFields[i][j + 1] || game.ship.goodFields[i][j + 1] !==1)
                                right = true;

                            if(top && !bottom && !left && !right)
                                elements[i][j].classList.add('board__box--green-top');
                            if(!top && bottom && !left && !right)
                                elements[i][j].classList.add('board__box--green-bottom');
                            if(!top && !bottom && left && !right)
                                elements[i][j].classList.add('board__box--green-left');
                            if(!top && !bottom && !left && right)
                                elements[i][j].classList.add('board__box--green-right');
                            if(top && bottom && !left && !right)
                                elements[i][j].classList.add('board__box--green-top-bottom');
                            if(top && !bottom && left && !right)
                                elements[i][j].classList.add('board__box--green-top-left');
                            if(top && !bottom && !left && right)
                                elements[i][j].classList.add('board__box--green-top-right');
                            if(top && !bottom && left && right)
                                elements[i][j].classList.add('board__box--green-top-left-right');
                            if(!top && bottom && left && !right)
                                elements[i][j].classList.add('board__box--green-bottom-left');
                            if(!top && bottom && !left && right)
                                elements[i][j].classList.add('board__box--green-bottom-right');
                            if(!top && bottom && left && right)
                                elements[i][j].classList.add('board__box--green-bottom-left-right');
                            if(!top && !bottom && left && right)
                                elements[i][j].classList.add('board__box--green-left-right');
                            if(top && bottom && left && !right)
                                elements[i][j].classList.add('board__box--green-top-bottom-left');
                            if(top && bottom && !left && right)
                                elements[i][j].classList.add('board__box--green-top-bottom-right');
                            if(top && bottom && left && right)
                                elements[i][j].classList.add('board__box--green-whole');
                        }
                    }
                } 
            }        
        }
    }
}

const checkGameStatus = async () => {
    if(localStorage.getItem('game')) {
        const message = document.createElement('div');
        const mesBackground = document.createElement('div');
        const btnWrapper = document.createElement('div');
        const yesButton = document.createElement('button');
        const noButton = document.createElement('button');
    
        btnWrapper.classList.add('message__btn-wrapper');
        yesButton.innerText = `Tak`;
        yesButton.classList.add('btn', 'message__btn');
        noButton.innerText = `Nie`;
        noButton.classList.add('btn', 'message__btn');
        message.classList.add('message');
        mesBackground.classList.add('message__background');
        
        btnWrapper.appendChild(yesButton);
        btnWrapper.appendChild(noButton);
        message.innerText = `Czy chcesz wczytać poprzednią rozgrywkę?`;
        message.appendChild(btnWrapper);
        document.querySelector('body').appendChild(mesBackground);
        document.querySelector('body').appendChild(message);
       
        const choice = new Promise(resolve => {
            yesButton.addEventListener('click', () => resolve(true));
            noButton.addEventListener('click', () => resolve(false));
        });

        await choice.then((result) => {
        if(result)
        {
            game.setGame(JSON.parse(localStorage.getItem('game')));
            document.querySelector('body').removeChild(mesBackground);
            document.querySelector('body').removeChild(message);
        }
        else
        {
            game.setGame();
            localStorage.removeItem('game');
            document.querySelector('body').removeChild(mesBackground);
            document.querySelector('body').removeChild(message);
        }});
    }
    else 
        game.setGame();       
};