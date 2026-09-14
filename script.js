/* =====================================================
   爆弾リレー Ver.1
===================================================== */


/* =====================================================
   画面
===================================================== */

const screens = {
    title: document.getElementById("titleScreen"),
    playerCount: document.getElementById("playerCountScreen"),
    name: document.getElementById("nameScreen"),
    seat: document.getElementById("seatScreen"),
    rule: document.getElementById("ruleScreen"),
    pass: document.getElementById("passScreen"),
    game: document.getElementById("gameScreen"),
    success: document.getElementById("successScreen"),
    explosion: document.getElementById("explosionScreen"),
    result: document.getElementById("resultScreen")
};


function showScreen(screen) {

    Object.values(screens).forEach(s => {
        s.classList.remove("active");
    });

    screen.classList.add("active");
}


/* =====================================================
   プレイヤー
===================================================== */

let playerCount = 0;
let players = [];

let currentPlayerIndex = 0;

let rotation = 0;

let timer = 10;
const START_TIME = 10;
const MAX_TIME = 15;

let timerInterval = null;

let currentCode = "";

let clearCount = 0;


/* =====================================================
   タイトル → 人数選択
===================================================== */

document.getElementById("startButton").addEventListener("click", () => {

    showScreen(screens.playerCount);

});


/* =====================================================
   人数選択
===================================================== */

document.querySelectorAll(".count-button").forEach(button => {

    button.addEventListener("click", () => {

        playerCount = Number(button.dataset.count);

        createNameInputs();

        showScreen(screens.name);

    });

});


/* =====================================================
   人数選択に戻る
===================================================== */

document.getElementById("countBackButton").addEventListener("click", () => {

    showScreen(screens.title);

});


/* =====================================================
   名前入力欄作成
===================================================== */

function createNameInputs() {

    const container = document.getElementById("nameInputs");

    container.innerHTML = "";

    for (let i = 0; i < playerCount; i++) {

        const row = document.createElement("div");
        row.className = "name-row";

        const label = document.createElement("div");
        label.className = "name-label";
        label.textContent = `プレイヤー${i + 1}`;

        const input = document.createElement("input");
        input.className = "name-input";
        input.type = "text";
        input.maxLength = 10;
        input.placeholder = `プレイヤー${i + 1}`;

        input.dataset.index = i;

        row.appendChild(label);
        row.appendChild(input);

        container.appendChild(row);
    }
}


/* =====================================================
   名前 → 座席
===================================================== */

document.getElementById("nameNextButton").addEventListener("click", () => {

    const inputs = document.querySelectorAll(".name-input");

    players = [];

    inputs.forEach((input, index) => {

        let name = input.value.trim();

        if (name === "") {
            name = `プレイヤー${index + 1}`;
        }

        players.push({
            name: name,
            alive: true,
            clears: 0
        });

    });

    createSeatMap();

    showScreen(screens.seat);

});


/* =====================================================
   名前画面に戻る
===================================================== */

document.getElementById("nameBackButton").addEventListener("click", () => {

    showScreen(screens.playerCount);

});


/* =====================================================
   座席配置
===================================================== */

function createSeatMap() {

    const top = document.getElementById("seatTop");
    const right = document.getElementById("seatRight");
    const bottom = document.getElementById("seatBottom");
    const left = document.getElementById("seatLeft");

    top.textContent = "";
    right.textContent = "";
    bottom.textContent = "";
    left.textContent = "";

    const seats = [top, right, bottom, left];

    seats.forEach(seat => {
        seat.style.display = "none";
    });


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

        top.style.display = "flex";
        bottom.style.display = "flex";

    }


    if (playerCount === 3) {

        top.textContent = players[0].name;
        right.textContent = players[1].name;
        left.textContent = players[2].name;

        top.style.display = "flex";
        right.style.display = "flex";
        left.style.display = "flex";

    }


    if (playerCount === 4) {

        top.textContent = players[0].name;
        right.textContent = players[1].name;
        bottom.textContent = players[2].name;
        left.textContent = players[3].name;

        seats.forEach(seat => {
            seat.style.display = "flex";
        });

    }


    createTurnOrder();

}


/* =====================================================
   順番表示
===================================================== */

function createTurnOrder() {

    const order = document.getElementById("turnOrder");

    const names = players.map(player => player.name);

    order.textContent =
        "順番： " + names.join(" → ") + " → " + names[0];

}


/* =====================================================
   座席 → ルール
===================================================== */

document.getElementById("seatNextButton").addEventListener("click", () => {

    showScreen(screens.rule);

});


/* =====================================================
   ゲーム開始
===================================================== */

document.getElementById("gameStartButton").addEventListener("click", () => {

    currentPlayerIndex = 0;

    clearCount = 0;

    rotation = 0;

    players.forEach(player => {
        player.alive = true;
        player.clears = 0;
    });

    setRotation(0);

    showPassScreen();

});


/* =====================================================
   プレイヤー交代画面
===================================================== */

function showPassScreen() {

    const player = players[currentPlayerIndex];

    document.getElementById("passPlayerName").textContent =
        player.name + "さんの番！";

    showScreen(screens.pass);

}


/* =====================================================
   爆弾を受け取る
===================================================== */

document.getElementById("receiveButton").addEventListener("click", () => {

    startBomb();

});


/* =====================================================
   爆弾スタート
===================================================== */

function startBomb() {

    timer = START_TIME;

    generateCode();

    updateTimer();

    showScreen(screens.game);

    document.getElementById("currentPlayerName").textContent =
        players[currentPlayerIndex].name;

    document.getElementById("clearCount").textContent =
        clearCount;

    document.getElementById("message").textContent = "";

    document.getElementById("codeInput").value = "";

    startTimer();

}


/* =====================================================
   タイマー
===================================================== */

function startTimer() {

    clearInterval(timerInterval);

    let previousTime = performance.now();

    timerInterval = setInterval(() => {

        const now = performance.now();

        const delta = (now - previousTime) / 1000;

        previousTime = now;

        timer -= delta;

        if (timer <= 0) {

            timer = 0;

            updateTimer();

            clearInterval(timerInterval);

            explode();

            return;
        }

        updateTimer();

    }, 20);

}


/* =====================================================
   タイマー表示
===================================================== */

function updateTimer() {

    const timerText = document.getElementById("timerText");
    const timerBar = document.getElementById("timerBar");

    timerText.textContent = timer.toFixed(2);

    const percentage =
        Math.max(0, Math.min(100, (timer / MAX_TIME) * 100));

    timerBar.style.width = percentage + "%";


    /*
       残り時間によって警告
    */

    if (timer <= 3) {

        timerText.style.color = "#ff5555";

    } else if (timer <= 5) {

        timerText.style.color = "#ffaa00";

    } else {

        timerText.style.color = "#fff";

    }

}


/* =====================================================
   暗証番号生成
===================================================== */

function generateCode() {

    currentCode =
        Math.floor(1000 + Math.random() * 9000).toString();

    document.getElementById("codeDisplay").textContent =
        currentCode;

}


/* =====================================================
   ミッション回答
===================================================== */

document.getElementById("answerButton").addEventListener("click", () => {

    const input =
        document.getElementById("codeInput").value.trim();

    if (input === currentCode) {

        missionClear();

    } else {

        document.getElementById("message").textContent =
            "❌ 違います！";

    }

});


/* =====================================================
   Enterでも回答
===================================================== */

document.getElementById("codeInput").addEventListener("keydown", event => {

    if (event.key === "Enter") {

        document.getElementById("answerButton").click();

    }

});


/* =====================================================
   ミッション成功
===================================================== */

function missionClear() {

    clearInterval(timerInterval);

    players[currentPlayerIndex].clears++;

    clearCount++;

    /*
       +1秒
       最大15秒
    */

    timer = Math.min(timer + 1, MAX_TIME);

    document.getElementById("successTime").textContent =
        `残り時間 ${timer.toFixed(2)}秒`;

    showScreen(screens.success);


    setTimeout(() => {

        nextPlayer();

    }, 900);

}


/* =====================================================
   次のプレイヤー
===================================================== */

function nextPlayer() {

    const nextIndex = findNextAlivePlayer();

    if (nextIndex === -1) {
        return;
    }

    currentPlayerIndex = nextIndex;

    rotateToPlayer();

    showPassScreen();

}


/* =====================================================
   生存している次のプレイヤー
===================================================== */

function findNextAlivePlayer() {

    for (let i = 1; i <= players.length; i++) {

        const index =
            (currentPlayerIndex + i) % players.length;

        if (players[index].alive) {

            return index;

        }

    }

    return -1;

}


/* =====================================================
   画面回転
===================================================== */

function rotateToPlayer() {

    /*
       プレイヤーの座席位置に合わせて回転

       2人：
       0 → 180

       3人：
       0 → 90 → 180

       4人：
       0 → 90 → 180 → 270

       常に90°単位。
    */

    if (playerCount === 2) {

        rotation += 180;

    } else {

        rotation += 90;

    }

    rotation %= 360;

    setRotation(rotation);

}


function setRotation(degrees) {

    document.getElementById("gameRotator").style.transform =
        `rotate(${degrees}deg)`;

}


/* =====================================================
   爆発
===================================================== */

function explode() {

    clearInterval(timerInterval);

    const player = players[currentPlayerIndex];

    player.alive = false;

    document.getElementById("explodedPlayer").textContent =
        player.name + "さん";

    showScreen(screens.explosion);


    setTimeout(() => {

        checkGameEnd();

    }, 1800);

}


/* =====================================================
   ゲーム終了判定
===================================================== */

function checkGameEnd() {

    const alivePlayers =
        players.filter(player => player.alive);

    /*
       最後の1人
    */

    if (alivePlayers.length === 1) {

        showResult();

        return;

    }


    /*
       まだゲーム続行
    */

    const nextIndex = findNextAlivePlayer();

    currentPlayerIndex = nextIndex;

    rotateToPlayer();

    showPassScreen();

}


/* =====================================================
   結果
===================================================== */

function showResult() {

    const alivePlayers =
        players.filter(player => player.alive);

    const winner = alivePlayers[0];

    document.getElementById("resultWinner").textContent =
        `🏆 ${winner.name}さんの優勝！`;


    const ranking = document.getElementById("ranking");

    ranking.innerHTML = "";


    /*
       生存者 → 1位
       それ以外 → 脱落した順を逆にして順位
    */

    const eliminated =
        players.filter(player => !player.alive);


    const rankingPlayers =
        [winner, ...eliminated.reverse()];


    rankingPlayers.forEach((player, index) => {

        const row = document.createElement("div");

        row.className = "rank-row";

        const number = document.createElement("div");

        number.className = "rank-number";

        number.textContent =
            `${index + 1}位`;

        const name = document.createElement("div");

        name.className = "rank-name";

        name.textContent =
            player.name;

        const status = document.createElement("div");

        status.className = "rank-status";

        status.textContent =
            `解除 ${player.clears}回`;

        row.appendChild(number);
        row.appendChild(name);
        row.appendChild(status);

        ranking.appendChild(row);

    });


    showScreen(screens.result);

}


/* =====================================================
   もう一度
===================================================== */

document.getElementById("retryButton").addEventListener("click", () => {

    currentPlayerIndex = 0;

    rotation = 0;

    clearCount = 0;

    players.forEach(player => {

        player.alive = true;
        player.clears = 0;

    });

    setRotation(0);

    showPassScreen();

});


/* =====================================================
   タイトルへ
===================================================== */

document.getElementById("titleButton").addEventListener("click", () => {

    clearInterval(timerInterval);

    playerCount = 0;

    players = [];

    currentPlayerIndex = 0;

    rotation = 0;

    clearCount = 0;

    setRotation(0);

    showScreen(screens.title);

});
