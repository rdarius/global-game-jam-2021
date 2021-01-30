import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import fs from 'fs'
import cors from 'cors'
import path from 'path'

const app = express()
const server = new http.Server(app)
const io = new socketIO.Server(server)

class Players {

    private players: {
        socketID: string,
        player: Player
    }[]

    constructor() {
        this.players = []
    }

    addPlayer(id: string, player: Player) {
        this.players.push({
            socketID: id,
            player: player
        })
    }

    removePlayer(id: string) {
        this.players = this.players.filter((player) => {
            return player.socketID !== id
        })
    }

    getPlayers(): Player[] {
        let playerList = []
        for (let player of this.players) {
            playerList.push(player.player)
        }
        return playerList
    }

    updatePlayerPosition(id: string, position: {x: number, y: number}) {
        for (let player of this.players) {
            if (player.socketID === id) {
                player.player.setPosition(position.x, position.y)
            }
        }
    }

}

class Player {

    private name: string
    private position: {x: number, y: number}
    private color: string

    constructor(private socket: socketIO.Socket) {
        this.name = 'Player#' + Math.floor(Math.random() * 10000)
        this.position = {
            x: Math.random()*10 - 5,
            y: Math.random()*10 - 5,
        }
        this.color = '#' + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16)
    }

    getPlayerDescription() {
        return {
            name: this.name,
            color: this.color,
            position: this.position,
            id: this.socket.id,
        }
    }

    setPosition(x: number, y: number) {
        this.position.x = x
        this.position.y = y
    }

}

const players = new Players()

app.use(cors())

app.use(express.static(path.join(__dirname, '/../../client/static/assets')))
app.use(express.static(path.join(__dirname, '/../../client/dist')))

app.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname + '/../../client/static/'});
});

server.listen(8089, function(){
    console.log('running on port 8089');
});

io.on('connection', function(socket: socketIO.Socket) {
    console.log('Player connected');
    let player = new Player(socket)
    let otherPlayers = []
    for (let p of players.getPlayers()) {
        otherPlayers.push(p.getPlayerDescription())
    }
    players.addPlayer(socket.id, player)
    socket.emit('players-info', otherPlayers)
    io.emit('new-player-joined', player.getPlayerDescription())
    socket.emit('your-info', player.getPlayerDescription())
    socket.on('message', function(msg) {
        console.log(msg)
    });
    socket.on('i-moved', (position: {x: number, y: number}) => {
        players.updatePlayerPosition(socket.id, {x: position.x, y: position.y})
        io.emit('player-moved', {id: socket.id, position: position})
    })
});
