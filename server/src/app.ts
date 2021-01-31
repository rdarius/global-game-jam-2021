import express from 'express'
import http from 'http'
import socketIO from 'socket.io'
import cors from 'cors'
import path from 'path'
import Players from './Players'
import Player from './Player'
import PlayerList from './PlayerList'
import { Position } from './types'
import Pickable from './Pickable'
import Item from './Item'
import * as uuid from 'uuid'
import fs from 'fs'




const minx = -3000
const maxx = 3000
const miny = -3000
const maxy = 3000


const app = express()
const server = new http.Server(app)
const io = new socketIO.Server(server)

const players = new Players()
let items: Pickable[] = []
const playerList = new PlayerList()

let scores = JSON.parse(fs.readFileSync(__dirname + '/../score.json').toString())

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

function makePointsItem() {
    let item = new Item('Points', "POINTS")
    let pickable = new Pickable(
        uuid.v4(),    
        {
            x: Math.floor(Math.random() * (Math.abs(minx) + maxx) + minx),
            y: Math.floor(Math.random() * (Math.abs(miny) + maxy) + miny),
        },
        item
    )
    items.push(pickable)
    io.emit('new-item', {id: pickable.id, position: pickable.position, item: {image: pickable.item.image, type: pickable.item.type}})
}

makePointsItem()

io.on('connection', function(socket: socketIO.Socket) {
    console.log(socket.id, 'connected');

    socket.emit('greetings')

    socket.on('greetings', (data: {name: string}) => {
        let player = new Player(socket)
        player.setName(data.name)
        playerList.addPlayer(socket.id, player)

        socket.emit('your-info', player.getPlayerDescription())
        io.emit('new-player-joined', player.getPlayerDescription())

        let best = {
            name: '',
            score: 0
        }

        for (let name in scores) {
            if (scores[name] > best.score) {
                best.name = name
                best.score = scores[name]
            }
        }

        socket.emit('best-player', best)

    })

    socket.on('get-other-players', () => {
        playerList.getPlayers().forEach((player) => {
            io.emit('new-player-joined', player.getPlayerDescription())
        })

        for (let item of items) {
            io.emit('new-item', {id: item.id, position: item.position, item: {image: item.item.image, type: item.item.type}})
        }
    })

    socket.on('disconnect', () => {
        console.log(socket.id, 'disconnected', (playerList.getPlayers().size - 1))
        playerList.removePlayer(socket.id)
        io.emit('player-disconnected', socket.id)
    })

    socket.on('key-action', (data: {key: number, isDown: boolean}) => {
        socket.broadcast.emit('key-action', {id: socket.id, key: data.key, isDown: data.isDown})
    })

    socket.on('player-moved', (data: {position: Position}) => {
        let player = playerList.getPlayer(socket.id)
        if (player) {
            player.setPosition(data.position.x, data.position.y)
        }
        socket.broadcast.emit('player-moved', {id: socket.id, position: data.position})
    })

    socket.on('hit-player', (data: {id: string, health: number}) => {
        let player = playerList.getPlayer(data.id)
        if (player) {
            if (data.health <= 0) {
                player.socket.disconnect()
                return
            }
            player.setHealth(data.health)
        }
        socket.broadcast.emit('hit-player', {id: data.id, health: data.health})
    })

    socket.on('shoot', (data: {id: string, position: Position, direction: Position}) => {
        socket.broadcast.emit('shoot', {id: socket.id, position: data.position, direction: data.direction})
    })

    socket.on('item-picked', (data: {id: string}) => {
        console.log('item picked')
        let player = playerList.getPlayer(socket.id)
        if (player) {
            console.log('player found')
            for (let item of items) {
                if (item.id === data.id && item.item.type === "POINTS") {
                    console.log('item points')
                    player.addScore()
                    if (scores[player.getName()] && scores[player.getName()] < player.getScore()) {
                        console.log('update score')
                        scores[player.getName()] = player.getScore()
                        fs.writeFileSync(__dirname + '/../score.json', JSON.stringify(scores))
                    } else {
                        console.log('new score')
                        scores[player.getName()] = player.getScore()
                        fs.writeFileSync(__dirname + '/../score.json', JSON.stringify(scores))
                    }
                    
                    let best = {
                        name: '',
                        score: 0
                    }
                    for (let name in scores) {
                        if (scores[name] > best.score) {
                            best.name = name
                            best.score = scores[name]
                        }
                    }
                    io.emit('best-player', best)

                    io.emit('update-score', {id: player.socket.id, score: player.getScore()})
                    makePointsItem()
                    break;
                }
            }
        }
        items = items.filter((item) => {
            return item.id !== data.id
        })
        socket.broadcast.emit('item-picked-resolve', {id: data.id})
    })




    // socket.on('shoot', (data: {position: {x: number, y: number}, direction: {x: number, y: number}}) => {
    //     console.log(socket.id, 'shoot')
    //     io.emit('shoot', {id: socket.id, position: data.position, direction: data.direction})
    // })

    // socket.on('hit-player', (data: {player: string, damage: number}) => {
    //     console.log(socket.id, 'hit-player')
    //     let hpLeft = players.takeDamage(data.player, data.damage)
    //     io.emit('health-update', {id: data.player, health: hpLeft})
    // })













    // // ITEM ACTIONS //

    // socket.on('item-heal', () => {
    //     console.log(socket.id, 'item-heal')
    //     let p = players.getPlayer(socket.id)
    //     if (p) {
    //         p.player.setHealth(100)
    //         io.emit('health-update', {id: p.player.socket.id, health: p.player.getHealth()})
    //     }
    // })

    // socket.on('item-defence', () => {
    //     console.log(socket.id, 'item-defence')
    //     let p = players.getPlayer(socket.id)
    //     if (p) {
    //         p.player.setDefence(p.player.getDefence() + 5)
    //     }
    // })

    // socket.on('item-damage', () => {
    //     console.log(socket.id, 'item-damage')
    //     let p = players.getPlayer(socket.id)
    //     if (p) {
    //         p.player.setDamage(p.player.getDamage() + 5)
    //     }
    // })

    // socket.on('key-action', (data: {key: number, isDown: boolean}) => {
    //     console.log(socket.id, 'key-action')
    //     let p = playerList.getPlayer(socket.id)
    //     if (p) {
    //         p.keyAction(data.key, data.isDown)
    //     }
    // })

});

setInterval(() => {

    if (items.length < 21) {
        let item = new Item('healthPack', "HEAL")
        let pickable = new Pickable(
            uuid.v4(),    
            {
                x: Math.floor(Math.random() * (Math.abs(minx) + maxx) + minx),
                y: Math.floor(Math.random() * (Math.abs(miny) + maxy) + miny),
            },
            item
        )
        items.push(pickable)
        io.emit('new-item', {id: pickable.id, position: pickable.position, item: {image: pickable.item.image, type: pickable.item.type}})
    }
}, 15000)

// let time = Date.now()

// const getDeltaTime = () => {
//     let t = Date.now()
//     let dt = t - time
//     time = t
//     return dt
// }

// setInterval(() => {
//     // game tick
//     let delta = getDeltaTime()

//     playerList.getPlayers().forEach((player) => {
//         if (player.getHealth() <= 0) {
//             player.socket.disconnect()
//         }

//         // player movement
//         let previosPosition = player.getPosition()
//         player.move(delta)
//         if (previosPosition.x !== player.getPosition().x || previosPosition.y !== player.getPosition().y) {
//             io.emit('player-moved', {id: player.socket.id, position: player.getPosition()})
//         }
//         // endof: player movement

//     })

// }, 1000/60)