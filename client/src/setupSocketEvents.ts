import SocketIOClient from 'socket.io-client'
import Bullet from './Bullet'
import { getCookie } from './Cookie'
import Game from './Game'
import Item from './Item'
import OtherPlayer from './OtherPlayer'
import Pickable from './Pickable'
import Player from './Player'
import { BulletData, PlayerDescription } from './socketDataTypes'
import { Position } from './types'

export default function setupSocketEvents(socket: SocketIOClient.Socket, game: Game) {

    socket.on('greetings', () => {
        socket.emit('greetings', {name: getCookie('player-name')})
    })

    socket.on('your-info', function (playerData: PlayerDescription) {
        let player = game.getPlayer()
        player.color = playerData.color
        player.id = playerData.id
        player.name = playerData.name
        player.position = playerData.position
        player.health = playerData.health
        socket.emit('get-other-players')
    })

    socket.on('new-player-joined', function (playerData: PlayerDescription) {
        if (game.getPlayer().id !== playerData.id) {
            let oPlayer = game.otherPlayers.getPlayer(playerData.id)
            if (oPlayer) {
                oPlayer.name = playerData.name
                oPlayer.position = playerData.position
                oPlayer.color = playerData.color
                oPlayer.health = playerData.health
                oPlayer.damage = playerData.damage
                oPlayer.defence = playerData.defence
            } else {
                game.otherPlayers.addPlayer(playerData.id, new Player(playerData.id, playerData.name, playerData.position, playerData.color, playerData.keysPressed, playerData.health, playerData.damage, playerData.defence))
            }
        }
    })

    socket.on('player-moved', function (movedPlayerData: {id: string, position: Position}) {
        let otherPlayer = game.otherPlayers.getPlayer(movedPlayerData.id)
        if (otherPlayer) {
            otherPlayer.position = movedPlayerData.position
        }
        if (game.getPlayer().id === movedPlayerData.id) {
            game.getPlayer().position = movedPlayerData.position
        }
    })

    socket.on('player-disconnected', function (disconnectedPlayer: string) {
        game.otherPlayers.removePlayer(disconnectedPlayer)
    })

    socket.on('key-action', (data: {id: string, key: number, isDown: boolean}) => {
        let player = game.otherPlayers.getPlayer(data.id)
        if (player) {
            player.keysPressed.set(data.key, data.isDown)
        }
    })

    socket.on('hit-player', (data: {id: string, health: number}) => {
        let player = game.otherPlayers.getPlayer(data.id)
        if (player) {
            player.health = data.health
        }
        if (game.getPlayer().id === data.id) {
            game.getPlayer().health = data.health
        }
    })

    socket.on('shoot', (data: BulletData) => {
        let otherPlayer = game.otherPlayers.getPlayer(data.id)
        if (otherPlayer) {
            otherPlayer.addBullet(new Bullet(otherPlayer, data.direction))
        }
    })

    socket.on('disconnect', () => {
        window.location.href = '/ded';
    })

    socket.on('ded', () => {
        window.location.href = '/ded';
    })

    socket.on('new-item', (data: {id: string, position: Position, item: {image: 'healthPack', type: "HEAL"}}) => {
        let image = game.getImages().get(data.item.image)
        if (image) {
            game.addItem(new Pickable(data.id, data.position, new Item(image, data.item.type)))
        }
    })

    socket.on('item-picked', (data: {id: string}) => {
        game.removeItemById(data.id)
    })
    
    // socket.on('health-update', (data: {id: string, health: number}) => {
    //     let otherPlayer = game.getOtherPlayer(data.id)
    //     if (otherPlayer) {
    //         otherPlayer.health = data.health
    //     }
    //     if (game.getPlayer().socket.id === data.id) {
    //         game.getPlayer().health = data.health
    //         if (data.health <= 0) {
    //             game.getPlayer().socket.disconnect()
    //             window.location.href = '/ded';
    //         }
    //     }
    // })
}