import SocketIOClient from "socket.io-client";
import Bullet from "./Bullet";
import OtherPlayer from "./OtherPlayer";
import { Position } from "./types";

export default class UserPlayer extends OtherPlayer{

    constructor(
        _id: string,
        private _socket: SocketIOClient.Socket,
        _name: string,
        _position: Position,
        _color: string,
        _keysPressed: Map<number, boolean>,
        _health: number
    ) {
        super(_id, _name, _position, _color, _keysPressed, _health)
    }

    get socket(): SocketIOClient.Socket {
        return this._socket
    }

    keyUp(key: number) {
        this.socket.emit('key-action', {key: key, isDown: false})
    }

    keyDown(key: number) {
        this.socket.emit('key-action', {key: key, isDown: true})
    }

}