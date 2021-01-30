import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
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

app.get('/game', function(req, res) {
    res.sendFile('game.html', { root: __dirname + '/../../client/static/'});
});

app.get('/ded', function(req, res) {
    res.sendFile('ded.html', { root: __dirname + '/../../client/static/'});
});

server.listen(8089, function() {
    console.log('running on port 8089');
});

io.on('connection', function(socket: socketIO.Socket) {
    console.log(socket.id, 'connected');

    socket.emit('greetings')

    socket.on('greetings', (data: {name: string}) => {
        let player = new Player(socket)
        player.setName(data.name)
        players.addPlayer(socket.id, player)

        socket.emit('your-info', player.getPlayerDescription())
        io.emit('new-player-joined', player.getPlayerDescription())
    })

    socket.on('get-other-players', () => {
        let otherPlayers = []
        for (let p of players.getPlayers()) {
            if (socket.id !== p.getPlayerDescription().id) {
                otherPlayers.push(p.getPlayerDescription())
            }
        }
        socket.emit('players-info', otherPlayers)
    })

    // socket.on('i-moved', (position: {x: number, y: number}) => {
    //     players.updatePlayerPosition(socket.id, {x: position.x, y: position.y})
    //     io.emit('player-moved', {id: socket.id, position: position})
    // })

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













    // ITEM ACTIONS //

    socket.on('item-heal', () => {
        let p = players.getPlayer(socket.id)
        if (p) {
            p.player.setHealth(100)
            io.emit('health-update', {id: p.player.socket.id, health: p.player.getHealth()})
        }
    })

    socket.on('item-defence', () => {
        let p = players.getPlayer(socket.id)
        if (p) {
            p.player.setDefence(p.player.getDefence() + 5)
        }
    })

    socket.on('item-damage', () => {
        let p = players.getPlayer(socket.id)
        if (p) {
            p.player.setDamage(p.player.getDamage() + 5)
        }
    })

    socket.on('key-action', (data: {key: number, isDown: boolean}) => {
        let p = players.getPlayer(socket.id)
        if (p) {
            p.player.keyAction(data.key, data.isDown)
        }
    })

});

let time = Date.now()

const getDeltaTime = () => {
    let t = Date.now()
    let dt = t - time
    time = t
    return dt
}

setInterval(() => {
    // game tick
    let delta = getDeltaTime()

    for (let player of players.getPlayers()) {

        if (player.getHealth() <= 0) {
            player.socket.disconnect()
        }

        // player movement
        let previosPosition = player.getPosition()
        player.move(delta)
        if (previosPosition.x !== player.getPosition().x || previosPosition.y !== player.getPosition().y) {
            io.emit('player-moved', {id: player.socket.id, position: player.getPosition()})
        }
        // endof: player movement

    }

}, 1000/60)