/* ==================================================
   爆弾リレー
   Version 2.0
================================================== */


/* ==================================================
   画面管理
================================================== */

const screens = document.querySelectorAll(".screen");

function showScreen(id) {
    screens.forEach(screen => {
        screen.classList.remove("active");
    });

    document.getElementById(id).classList.add("active");
}


/* ==================================================
   ゲームデータ
================================================== */

let gameMode = null;

let playerCount = 0;
let players = [];

let currentPlayerIndex = 0;

let timer = 10;
let timerInterval = null;

let currentCode = "";
let currentInput = "";

let gameRunning = false;
let inputLocked = false;

let rotation = 0;

const MAX_TIME = 15;
const START_TIME = 10;


/* ==================================================
   エンドレス
================================================== */

let endlessTimer = 10;
let endlessTimerInterval = null;

let endlessCode = "";
let endlessInput = "";

let endlessScore = 0;
let endlessRunning = false;
let endlessInputLocked = false;

let endlessBest = Number(
    localStorage.getItem("bombRelayEndlessBest") || 0
);


/* ==================================================
   タイトル
================================================== */

document.getElementById("multiModeButton").addEventListener("click", () => {

    gameMode = "multi";

    showScreen("playerCountScreen");
});


document.getElementById("endlessModeButton").addEventListener("click", () => {

    gameMode = "endless";

    document.getElementById("endlessBestStart").textContent =
        endlessBest;

    showScreen("endlessStartScreen");
});


/* ==================================================
   戻る
================================================== */

document.getElementById("backToTitleButton").addEventListener("click", () => {

    showScreen("titleScreen");

});


document.getElementById("endlessBackButton").addEventListener("click", () => {

    showScreen("titleScreen");

});


document.getElementById("titleButton").addEventListener("click", () => {

    stopTimer();

    showScreen("titleScreen");

});


document.getElementById("endlessTitleButton").addEventListener("click", () => {

    stopEndlessTimer();

    showScreen("titleScreen");

});


/* ==================================================
   人数選択
================================================== */

document.querySelectorAll(".count-button").forEach(button => {

    button.addEventListener("click", () => {

        playerCount = Number(button.dataset.count);

        createNameInputs();

        showScreen("nameScreen");

    });

});


/* ==================================================
   名前入力欄作成
================================================== */

function createNameInputs() {

    const container =
        document.getElementById("nameInputs");

    container.innerHTML = "";

    for (let i = 0; i < playerCount; i++) {

        const input =
            document.createElement("input");

        input.className = "name-input";
        input.placeholder = `プレイヤー${i + 1}`;
        input.maxLength = 10;
        input.dataset.index = i;

        container.appendChild(input);
    }

}


/* ==================================================
   名前決定
================================================== */

document.getElementById("nameNextButton").addEventListener("click", () => {

    players = [];

    const inputs =
        document.querySelectorAll(".name-input");

    inputs.forEach((input, index) => {

        let name = input.value.trim();

        if (name === "") {
            name = `プレイヤー${index + 1}`;
        }

        players.push({
            name: name,
            alive: true,
            eliminatedRank: null
        });

    });

    createSeatMap();

    showScreen("seatScreen");

});


/* ==================================================
   座席マップ
================================================== */

function createSeatMap() {

    const top =
        document.getElementById("seatTop");

    const right =
        document.getElementById("seatRight");

    const bottom =
        document.getElementById("seatBottom");

    const left =
        document.getElementById("seatLeft");


    top.textContent = "";
    right.textContent = "";
    bottom.textContent = "";
    left.textContent = "";


    /*
       2人
       上・下

       3人
       上・右・左

       4人
       上・右・下・左
    */

    if (playerCount === 2) {

        top.textContent = players[0].name;
        bottom.textContent = players[1].name;

        right.style.display = "none";
        left.style.display = "none";
        top.style.display = "flex";
        bottom.style.display = "flex";

    }

    else if (playerCount === 3) {

        top.textContent = players[0].name;
        right.textContent = players[1].name;
        left.textContent = players[2].name;

        top.style.display = "flex";
        right.style.display = "flex";
        left.style.display = "flex";
        bottom.style.display = "none";

    }

    else {

        top.textContent = players[0].name;
        right.textContent = players[1].name;
        bottom.textContent = players[2].name;
        left.textContent = players[3].name;

        top.style.display = "flex";
        right.style.display = "flex";
        bottom.style.display = "flex";
        left.style.display = "flex";

    }

}


/* ==================================================
   座席確認
================================================== */

document.getElementById("seatNextButton").addEventListener("click", () => {

    showScreen("ruleScreen");

});


/* ==================================================
   ルール → 最初の番
================================================== */

document.getElementById("ruleNextButton").addEventListener("click", () => {

    currentPlayerIndex = 0;

    setRotationForPlayer(currentPlayerIndex);

    document.getElementById("firstTurnText").textContent =
        `${players[currentPlayerIndex].name}さんの番！`;

    showScreen("firstTurnScreen");

});


/* ==================================================
   最初のスタート
================================================== */

document.getElementById("firstTurnStartButton").addEventListener("click", () => {

    timer = START_TIME;

    gameRunning = true;

    startPlayerTurn();

});


/* ==================================================
   プレイヤーの座席に合わせて回転
================================================== */

function getPlayerRotation(index) {

    /*
       上 = 0°
       右 = 90°
       下 = 180°
       左 = 270°

       3人の場合もこの4方向だけを使用。
       斜めにはならない。
    */

    if (playerCount === 2) {

        if (index === 0) return 0;
        if (index === 1) return 180;

    }


    if (playerCount === 3) {

        if (index === 0) return 0;
        if (index === 1) return 90;
        if (index === 2) return 270;

    }


    if (playerCount === 4) {

        if (index === 0) return 0;
        if (index === 1) return 90;
        if (index === 2) return 180;
        if (index === 3) return 270;

    }

    return 0;
}


function setRotationForPlayer(index) {

    rotation = getPlayerRotation(index);

    document.getElementById("gameScreen").style.transform =
        `rotate(${rotation}deg)`;

}


/* ==================================================
   プレイヤーの番開始
================================================== */

function startPlayerTurn() {

    inputLocked = false;

    currentInput = "";

    document.getElementById("currentPlayerName").textContent =
        players[currentPlayerIndex].name;

    updateTimerDisplay();

    generateMission();

    showScreen("gameScreen");

    startTimer();

}


/* ==================================================
   ミッションシステム
================================================== */

/*
   今は4桁コードミッション。

   後から、

   generateNumberMission()
   generateCalculationMission()
   generateMemoryMission()

   などを追加して、

   generateMission()

   の中でランダムに呼べば
   ミッションを増やせる構造。
*/

function generateMission() {

    generateCodeMission();

}


/* ==================================================
   4桁コードミッション
================================================== */

function generateCodeMission() {

    currentCode =
        Math.floor(1000 + Math.random() * 9000)
        .toString();

    currentInput = "";

    document.getElementById("codeDisplay").textContent =
        currentCode;

    updateInputDisplay();

}


/* ==================================================
   入力表示
================================================== */

function updateInputDisplay() {

    let display = "";

    for (let i = 0; i < 4; i++) {

        if (currentInput[i]) {
            display += currentInput[i];
        } else {
            display += "_";
        }

    }

    document.getElementById("inputDisplay").textContent =
        display;

}


/* ==================================================
   キーパッド
================================================== */

document.querySelectorAll(".key-button").forEach(button => {

    button.addEventListener("click", () => {

        const key = button.dataset.key;

        handleKey(key);

    });

});


function handleKey(key) {

    if (!gameRunning || inputLocked) {
        return;
    }


    if (key === "backspace") {

        currentInput =
            currentInput.slice(0, -1);

        updateInputDisplay();

        return;
    }


    if (currentInput.length >= 4) {
        return;
    }


    currentInput += key;

    updateInputDisplay();

}


/* ==================================================
   答え確認
================================================== */

document.getElementById("confirmButton").addEventListener("click", () => {

    if (!gameRunning || inputLocked) {
        return;
    }

    if (currentInput.length !== 4) {
        return;
    }


    if (currentInput === currentCode) {

        missionSuccess();

    }

});


/* ==================================================
   タイマー開始
================================================== */

function startTimer() {

    stopTimer();

    timerInterval = setInterval(() => {

        timer -= 0.1;

        if (timer <= 0) {

            timer = 0;

            updateTimerDisplay();

            explodeCurrentPlayer();

            return;

        }

        updateTimerDisplay();

    }, 100);

}


/* ==================================================
   タイマー停止
================================================== */

function stopTimer() {

    if (timerInterval !== null) {

        clearInterval(timerInterval);

        timerInterval = null;

    }

}


/* ==================================================
   タイマー表示
================================================== */

function updateTimerDisplay() {

    document.getElementById("timer").textContent =
        timer.toFixed(1);

    const percent =
        (timer / MAX_TIME) * 100;

    document.getElementById("timerBar").style.width =
        `${Math.max(0, percent)}%`;

}


/* ==================================================
   ミッション成功
================================================== */

function missionSuccess() {

    if (inputLocked) {
        return;
    }

    inputLocked = true;

    stopTimer();


    /*
       成功したら+1秒。
       最大15秒。
    */

    timer = Math.min(timer + 1, MAX_TIME);

    updateTimerDisplay();

    showScreen("successScreen");


    setTimeout(() => {

        nextPlayer();

    }, 700);

}


/* ==================================================
   次のプレイヤー
================================================== */

function nextPlayer() {

    if (!gameRunning) {
        return;
    }


    let nextIndex =
        findNextAlivePlayer(currentPlayerIndex);


    /*
       生き残っているプレイヤーが
       1人だけならゲーム終了。
    */

    if (countAlivePlayers() <= 1) {

        finishGame();

        return;

    }


    currentPlayerIndex = nextIndex;

    setRotationForPlayer(currentPlayerIndex);

    startPlayerTurn();

}


/* ==================================================
   次の生存プレイヤー
================================================== */

function findNextAlivePlayer(startIndex) {

    let index = startIndex;

    for (let i = 0; i < players.length; i++) {

        index++;

        if (index >= players.length) {
            index = 0;
        }

        if (players[index].alive) {
            return index;
        }

    }

    return startIndex;

}


/* ==================================================
   爆発
================================================== */

function explodeCurrentPlayer() {

    if (!gameRunning) {
        return;
    }

    inputLocked = true;

    stopTimer();

    players[currentPlayerIndex].alive = false;


    /*
       脱落順位を記録
    */

    const eliminatedCount =
        players.filter(player => !player.alive).length;

    players[currentPlayerIndex].eliminatedRank =
        players.length - eliminatedCount + 1;


    document.getElementById("explosionPlayer").textContent =
        `${players[currentPlayerIndex].name}さん`;

    showScreen("explosionScreen");

}


/* ==================================================
   爆発後
================================================== */

document.getElementById("explosionNextButton").addEventListener("click", () => {

    /*
       残り1人なら終了。
    */

    if (countAlivePlayers() <= 1) {

        finishGame();

        return;

    }


    currentPlayerIndex =
        findNextAlivePlayer(currentPlayerIndex);

    setRotationForPlayer(currentPlayerIndex);

    inputLocked = false;

    startPlayerTurn();

});


/* ==================================================
   生存人数
================================================== */

function countAlivePlayers() {

    return players.filter(player => player.alive).length;

}


/* ==================================================
   ゲーム終了
================================================== */

function finishGame() {

    gameRunning = false;

    stopTimer();

    /*
       最後に残った人
    */

    const winner =
        players.find(player => player.alive);


    document.getElementById("winnerText").textContent =
        `🏆 ${winner.name}さんの勝利！`;


    createRanking();

    document.getElementById("gameScreen").style.transform =
        "rotate(0deg)";


    showScreen("resultScreen");

}


/* ==================================================
   ランキング
================================================== */

function createRanking() {

    const container =
        document.getElementById("ranking");

    container.innerHTML = "";


    const sortedPlayers =
        [...players].sort((a, b) => {

            if (a.alive) {
                return -1;
            }

            if (b.alive) {
                return 1;
            }

            return a.eliminatedRank - b.eliminatedRank;

        });


    sortedPlayers.forEach((player, index) => {

        const row =
            document.createElement("div");

        row.className = "rank-row";


        let rank;

        if (player.alive) {
            rank = "🥇";
        } else {
            rank = `${index + 1}位`;
        }


        row.innerHTML = `
            <span>${rank}</span>
            <span>${player.name}</span>
        `;


        container.appendChild(row);

    });

}


/* ==================================================
   もう一度
================================================== */

document.getElementById("againButton").addEventListener("click", () => {

    players.forEach(player => {

        player.alive = true;
        player.eliminatedRank = null;

    });


    currentPlayerIndex = 0;

    timer = START_TIME;

    setRotationForPlayer(0);

    document.getElementById("firstTurnText").textContent =
        `${players[0].name}さんの番！`;

    showScreen("firstTurnScreen");

});


/* ==================================================
   ================================================
   エンドレスモード
   ================================================
================================================== */


/* ==================================================
   エンドレス開始
================================================== */

document.getElementById("endlessStartButton").addEventListener("click", () => {

    startEndlessGame();

});


function startEndlessGame() {

    stopEndlessTimer();

    endlessRunning = true;
    endlessInputLocked = false;

    endlessTimer = START_TIME;
    endlessScore = 0;
    endlessInput = "";

    document.getElementById("endlessScore").textContent =
        endlessScore;

    updateEndlessTimerDisplay();

    generateEndlessMission();

    showScreen("endlessGameScreen");

    startEndlessTimer();

}


/* ==================================================
   エンドレスミッション
================================================== */

function generateEndlessMission() {

    endlessCode =
        Math.floor(1000 + Math.random() * 9000)
        .toString();

    endlessInput = "";

    document.getElementById("endlessCodeDisplay").textContent =
        endlessCode;

    updateEndlessInputDisplay();

}


/* ==================================================
   エンドレス入力表示
================================================== */

function updateEndlessInputDisplay() {

    let display = "";

    for (let i = 0; i < 4; i++) {

        if (endlessInput[i]) {
            display += endlessInput[i];
        } else {
            display += "_";
        }

    }

    document.getElementById("endlessInputDisplay").textContent =
        display;

}


/* ==================================================
   エンドレスキーパッド
================================================== */

document.querySelectorAll(".endless-key").forEach(button => {

    button.addEventListener("click", () => {

        const key = button.dataset.key;

        handleEndlessKey(key);

    });

});


function handleEndlessKey(key) {

    if (!endlessRunning || endlessInputLocked) {
        return;
    }


    if (key === "backspace") {

        endlessInput =
            endlessInput.slice(0, -1);

        updateEndlessInputDisplay();

        return;
    }


    if (endlessInput.length >= 4) {
        return;
    }


    endlessInput += key;

    updateEndlessInputDisplay();

}


/* ==================================================
   エンドレス確認
================================================== */

document.getElementById("endlessConfirmButton").addEventListener("click", () => {

    if (!endlessRunning || endlessInputLocked) {
        return;
    }

    if (endlessInput.length !== 4) {
        return;
    }


    if (endlessInput === endlessCode) {

        endlessMissionSuccess();

    }

});


/* ==================================================
   エンドレスタイマー
================================================== */

function startEndlessTimer() {

    stopEndlessTimer();

    endlessTimerInterval =
        setInterval(() => {

            endlessTimer -= 0.1;

            if (endlessTimer <= 0) {

                endlessTimer = 0;

                updateEndlessTimerDisplay();

                endEndlessGame();

                return;

            }

            updateEndlessTimerDisplay();

        }, 100);

}


/* ==================================================
   エンドレスタイマー停止
================================================== */

function stopEndlessTimer() {

    if (endlessTimerInterval !== null) {

        clearInterval(endlessTimerInterval);

        endlessTimerInterval = null;

    }

}


/* ==================================================
   エンドレスタイマー表示
================================================== */

function updateEndlessTimerDisplay() {

    document.getElementById("endlessTimer").textContent =
        endlessTimer.toFixed(1);

    const percent =
        (endlessTimer / MAX_TIME) * 100;

    document.getElementById("endlessTimerBar").style.width =
        `${Math.max(0, percent)}%`;

}


/* ==================================================
   エンドレス成功
================================================== */

function endlessMissionSuccess() {

    if (endlessInputLocked) {
        return;
    }

    endlessInputLocked = true;

    endlessTimer = Math.min(
        endlessTimer + 1,
        MAX_TIME
    );

    endlessScore++;

    document.getElementById("endlessScore").textContent =
        endlessScore;

    updateEndlessTimerDisplay();


    setTimeout(() => {

        endlessInputLocked = false;

        generateEndlessMission();

    }, 150);

}


/* ==================================================
   エンドレス終了
================================================== */

function endEndlessGame() {

    if (!endlessRunning) {
        return;
    }

    endlessRunning = false;

    endlessInputLocked = true;

    stopEndlessTimer();


    document.getElementById("endlessFinalScore").textContent =
        endlessScore;


    let newBest = false;


    if (endlessScore > endlessBest) {

        endlessBest = endlessScore;

        localStorage.setItem(
            "bombRelayEndlessBest",
            endlessBest
        );

        newBest = true;

    }


    if (newBest) {

        document.getElementById("newBestText").textContent =
            "🎉 NEW BEST! 🎉";

    } else {

        document.getElementById("newBestText").textContent =
            `BEST：${endlessBest} CLEAR`;

    }


    showScreen("endlessResultScreen");

}


/* ==================================================
   エンドレスもう一度
================================================== */

document.getElementById("endlessRetryButton").addEventListener("click", () => {

    startEndlessGame();

});
