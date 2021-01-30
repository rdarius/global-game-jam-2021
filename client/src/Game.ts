import { Socket } from "socket.io-client";
import Bullet from "./Bullet";
import OtherPlayer from "./OtherPlayer";
import UserPlayer from "./UserPlayer";
import { PlayerDescription } from "./socketDataTypes";
import Pickable from "./Pickable";

export default class Game {

    private player: UserPlayer
    private otherPlayers: OtherPlayer[] = []
    private bullets: Bullet[] = []
    private items: Pickable[] = []

    constructor(_socket: SocketIOClient.Socket) {
        this.player = new UserPlayer(_socket.id, _socket, '', {x:0, y:0}, 'white', new Map<number, boolean>(), 100)
    }

    addItem(item: Pickable) {
        this.items.push(item)
    }

    getItems() {
        return this.items
    }

    removeItem(pickable: Pickable) {
        this.items = this.items.filter((item) => {
            return item !== pickable
        })
    }

    getPlayer(): UserPlayer {
        return this.player
    }

    setPlayer(description: PlayerDescription) {
        this.player.id = description.id
        this.player.name = description.name
        this.player.position = description.position
        this.player.color = description.color
    }

    addOtherPlayer(player: OtherPlayer) {
        if (player.id === this.player.id) return
        let oPlayer = this.otherPlayers.find((otherPlayer) => {
            return player.id === otherPlayer.id
        })
        if (oPlayer) {
            oPlayer.color = player.color
            oPlayer.id = player.id
            oPlayer.name = player.name
            oPlayer.position = player.position
        } else {
            this.otherPlayers.push(player)
        }
    }

    removeOtherPlayer(id: string) {
        this.otherPlayers = this.otherPlayers.filter((player) => {
            return player.id !== id
        })
    }

    getOtherPlayers() {
        return this.otherPlayers
    }

    getOtherPlayer(id: string) {
        for (let player of this.otherPlayers) {
            if (player.id === id) {
                return player
            }
        }
        return null
    }

}