import Player from './Player'

export default class Players {

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

    takeDamage(id: string, damage: number) {
        for (let player of this.players) {
            if (player.socketID === id) {
                player.player.takeDamage(damage)
                if (player.player.getHealth() <= 0) {
                    player.player.socket.emit('ded')
                    player.player.socket.disconnect()
                    return player.player.getHealth()
                }
                return player.player.getHealth()
            }
        }
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