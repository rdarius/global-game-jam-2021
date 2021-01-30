import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import fs from 'fs'
import cors from 'cors'
import path from 'path'
import Players from './Players'
import Player from './Player'

const app = express()
const server = new http.Server(app)
const io = new socketIO.Server(server)

const players = new Players()

app.use(cors())

app.use(express.static(path.join(__dirname, '/../../client/static/assets')))
app.use(express.static(path.join(__dirname, '/../../client/dist')))

app.get('/', function(req, res) {
    res.sendFile('index.html', { root: __dirname + '/../../client/static/'});
});
app.get('/ded', function(req, res) {
    res.sendFile('ded.html', { root: __dirname + '/../../client/static/'});
});

server.listen(8089, function() {
    console.log('running on port 8089');
});

io.on('connection', function(socket: socketIO.Socket) {
    console.log(socket.id, 'connected');

    let player = new Player(socket)
    players.addPlayer(socket.id, player)
    socket.emit('your-info', player.getPlayerDescription())

    socket.on('get-other-players', () => {
        let otherPlayers = []
        for (let p of players.getPlayers()) {
            if (socket.id !== p.getPlayerDescription().id) {
                otherPlayers.push(p.getPlayerDescription())
            }
        }
        socket.emit('players-info', otherPlayers)
    })

    io.emit('new-player-joined', player.getPlayerDescription())


    socket.on('i-moved', (position: {x: number, y: number}) => {
        players.updatePlayerPosition(socket.id, {x: position.x, y: position.y})
        io.emit('player-moved', {id: socket.id, position: position})
    })

    socket.on('disconnect', () => {
        console.log(socket.id, 'disconnected')
        players.removePlayer(socket.id)
        io.emit('player-disconnected', socket.id)
    })

    socket.on('shoot', (data: {position: {x: number, y: number}, direction: {x: number, y: number}}) => {
        io.emit('shoot', {id: socket.id, position: data.position, direction: data.direction})
    })

    socket.on('hit-player', (data: {player: string, damage: number}) => {
        let hpLeft = players.takeDamage(data.player, data.damage)
        io.emit('health-update', {id: data.player, health: hpLeft})
    })

});
