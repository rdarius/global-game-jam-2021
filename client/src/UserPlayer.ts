import SocketIOClient from "socket.io-client";
import Bullet from "./Bullet";
import OtherPlayer from "./OtherPlayer";
import { Position } from "./types";

export default class UserPlayer extends OtherPlayer{

    private PLAYER_SPEED = 10
    private KEY_W = 87;
    private KEY_A = 65;
    private KEY_S = 83;
    private KEY_D = 68;

    constructor(
        _id: string,
        private _socket: SocketIOClient.Socket,
        _name: string,
        _position: Position,
        _color: string,
        private _keysPressed: Map<number, boolean>,
        _health: number
    ) {
        super(_id, _name, _position, _color, _health)
    }

    get socket(): SocketIOClient.Socket {
        return this._socket
    }

    keyPressed(key: number): boolean {
        return this._keysPressed.get(key) || false;
    }

    setKeyPressed(key: number, value: boolean) {
        this._keysPressed.set(key, value)
    }

    clearKeysPressed() {
        this._keysPressed.clear()
    }

    move() {
        let previousPosition = {
            x: this.position.x,
            y: this.position.y,
        }
        if (this.keyPressed(this.KEY_A)) {
            this.position.x -= this.PLAYER_SPEED;
        }
        if (this.keyPressed(this.KEY_D)) {
            this.position.x += this.PLAYER_SPEED;
        }
    
        if (this.keyPressed(this.KEY_W)) {
            this.position.y -= this.PLAYER_SPEED;
        }
        if (this.keyPressed(this.KEY_S)) {
            this.position.y += this.PLAYER_SPEED;
        }

        if (this.position.x < -1600) {
            this.position.x = -1600
        }

        if (this.position.y < -2000) {
            this.position.y = -2000
        }

        if (this.position.x > 1500) {
            this.position.x = 1500
        }

        if (this.position.y > 1900) {
            this.position.y = 1900
        }

        if (this.position.x !== previousPosition.x || this.position.y !== previousPosition.y) {
            this.socket.emit('i-moved', {x: this.position.x, y: this.position.y})
        }
    }

}