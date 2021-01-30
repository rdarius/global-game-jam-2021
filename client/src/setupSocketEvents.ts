import SocketIOClient from 'socket.io-client'
import Bullet from './Bullet'
import Game from './Game'
import OtherPlayer from './OtherPlayer'
import { BulletData, PlayerDescription } from './socketDataTypes'
import { Position } from './types'

export default function setupSocketEvents(socket: SocketIOClient.Socket, game: Game) {
    socket.on('your-info', function (playerData: PlayerDescription) {
        let player = game.getPlayer()
        player.color = playerData.color
        player.id = playerData.id
        player.name = playerData.name
        player.position = playerData.position
        player.health = playerData.health

        socket.emit('get-other-players')
    })
    socket.on('players-info', function (playersData: PlayerDescription[]) {
        for (let playerData of playersData) {
            game.addOtherPlayer(new OtherPlayer(playerData.id, playerData.name, playerData.position, playerData.color, playerData.health))
        }
    })
    socket.on('new-player-joined', function (playerData: PlayerDescription) {
        if (game.getPlayer().id !== playerData.id) {
            game.addOtherPlayer(new OtherPlayer(playerData.id, playerData.name, playerData.position, playerData.color, playerData.health))
        }
    })
    socket.on('player-moved', function (movedPlayerData: {id: string, position: Position}) {
        for (let playerData of game.getOtherPlayers()) {
            if (movedPlayerData.id === playerData.id) {
                playerData.position = movedPlayerData.position;
            }
        }
    })
    socket.on('player-disconnected', function (disconnectedPlayer: string) {
        game.removeOtherPlayer(disconnectedPlayer)
    })

    socket.on('shoot', (data: BulletData) => {
        let otherPlayer = game.getOtherPlayer(data.id)
        if (otherPlayer) {
            otherPlayer.addBullet(new Bullet(otherPlayer, data.direction))
        }
    })

    socket.on('ded', (data: BulletData) => {
        window.location.href = '/ded';
    })
    
    socket.on('health-update', (data: {id: string, health: number}) => {
        let otherPlayer = game.getOtherPlayer(data.id)
        if (otherPlayer) {
            otherPlayer.health = data.health
        }
        if (game.getPlayer().socket.id === data.id) {
            game.getPlayer().health = data.health
            if (data.health <= 0) {
                game.getPlayer().socket.disconnect()
                window.location.href = '/ded';
            }
        }
    })
}