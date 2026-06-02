const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const playerName =
    prompt("Ingrese su nombre") || "Jugador";

document.getElementById("playerName")
    .textContent = playerName;

let score = 0;

const player = {
    x: 100,
    y: 100,
    size: 20,
    speed: 10
};

const coin = {
    x: 300,
    y: 200,
    radius: 10
};

const socket = new WebSocket(
    "wss://gamehubmanager.azurewebsites.net/ws"
);

socket.onopen = () => {
    console.log("Conectado");
};

socket.onerror = (err) => {
    console.log(err);
};

socket.onclose = () => {
    console.log("Desconectado");
};

socket.onmessage = (event) => {

    try {

        const ranking =
            JSON.parse(event.data);

        mostrarRanking(ranking);

    } catch(error) {

        console.log("Error ranking");

    }
};

function enviarEvento(evento, valor){

    if(socket.readyState !== WebSocket.OPEN)
        return;

    const data = {
        game: "Pacman",
        event: evento,
        player: playerName,
        value: valor
    };

    socket.send(
        JSON.stringify(data)
    );
}

function mostrarRanking(ranking){

    const lista =
        document.getElementById(
            "ranking-list"
        );

    lista.innerHTML = "";

    ranking
        .slice(0,5)
        .forEach((p,index)=>{

            const li =
                document.createElement("li");

            li.textContent =
                `${index+1}. ${p.Player}
                 - ${p.Value}`;

            lista.appendChild(li);
        });
}

document.addEventListener(
    "keydown",
    (e)=>{

        switch(e.key){

            case "ArrowUp":
                player.y -= player.speed;
                break;

            case "ArrowDown":
                player.y += player.speed;
                break;

            case "ArrowLeft":
                player.x -= player.speed;
                break;

            case "ArrowRight":
                player.x += player.speed;
                break;
        }

        enviarEvento(
            "posicion",
            player.x
        );

        verificarMoneda();
    }
);

function verificarMoneda(){

    const dx =
        player.x - coin.x;

    const dy =
        player.y - coin.y;

    const distancia =
        Math.sqrt(
            dx * dx +
            dy * dy
        );

    if(distancia < 20){

        score += 100;

        document
            .getElementById("score")
            .textContent = score;

        enviarEvento(
            "score",
            score
        );

        coin.x =
            Math.random() *
            (canvas.width - 20);

        coin.y =
            Math.random() *
            (canvas.height - 20);
    }
}

function draw(){

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );

    ctx.fillStyle = "yellow";

    ctx.beginPath();

    ctx.arc(
        player.x,
        player.y,
        player.size,
        0,
        Math.PI * 2
    );

    ctx.fill();

    ctx.fillStyle = "gold";

    ctx.beginPath();

    ctx.arc(
        coin.x,
        coin.y,
        coin.radius,
        0,
        Math.PI * 2
    );

    ctx.fill();

    requestAnimationFrame(draw);
}

draw();