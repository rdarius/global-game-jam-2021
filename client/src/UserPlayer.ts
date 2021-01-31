import SocketIOClient from "socket.io-client";
import Player from "./Player";
import { Position } from "./types";

export default class UserPlayer extends Player {

    constructor(
        private _socket: SocketIOClient.Socket,
        _id: string,
        _name: string,
        _position: Position,
        _color: string,
        _keysPressed: Map<number, boolean>,
        _health: number,
        _damage: number,
        _defence: number
    ) {
        super(_id, _name, _position, _color, _keysPressed, _health, _damage, _defence)
    }

    get socket(): SocketIOClient.Socket {
        return this._socket
    }

    keyUp(key: number) {
        this.keysPressed.set(key, false)
        this.socket.emit('key-action', {key: key, isDown: false})
    }

    keyDown(key: number) {
        this.keysPressed.set(key, true)
        this.socket.emit('key-action', {key: key, isDown: true})
    }

}