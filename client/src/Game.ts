import { Socket } from "socket.io-client";
import Bullet from "./Bullet";
import OtherPlayer from "./OtherPlayer";
import UserPlayer from "./UserPlayer";
import { PlayerDescription } from "./socketDataTypes";
import Pickable from "./Pickable";
import Player from "./Player";
import PlayerList from "./PlayerList";
import p5 from "p5";

export default class Game {

    private player: UserPlayer
    private _otherPlayers: PlayerList
    private items: Pickable[] = []
    private images: Map<string, p5.Image> = new Map<string, p5.Image>()

    constructor(_socket: SocketIOClient.Socket) {
        this.player = new UserPlayer(_socket,_socket.id, 'Player', {x:0, y:0}, 'white', new Map<number, boolean>(), 100, 10, 10)
        this._otherPlayers = new PlayerList()
    }

    setImages(images: Map<string, p5.Image>) {
        this.images = images
    }

    getImages() {
        return this.images
    }

    get otherPlayers() {
        return this._otherPlayers
    }

    addItem(item: Pickable) {
        this.items.push(item)
    }

    getItems() {
        return this.items
    }

    removeItemById(id: string) {
        this.items = this.items.filter((item) => {
            return item.id !== id
        })
    }

    removeItem(pickable: Pickable) {
        this.items = this.items.filter((item) => {
            return item !== pickable
        })
    }

    getPlayer(): UserPlayer {
        return this.player
    }

}