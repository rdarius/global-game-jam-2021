import socketIO from 'socket.io'
import { Position } from './types'

export default class Player {

    private name: string
    private position: {x: number, y: number}
    private color: string
    private health: number
    private damage: number
    private defence: number
    private keysPressed: Map<number, boolean>

    private KEY_W = 87
    private KEY_A = 65
    private KEY_S = 83
    private KEY_D = 68

    private MOVEMENT_SPEED = 1

    constructor(private _socket: socketIO.Socket) {
        this.name = 'Player#' + Math.floor(Math.random() * 10000)
        this.position = {
            x: Math.random()*1000 - 500,
            y: Math.random()*1000 - 500,
        }
        this.color = '#' + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16)
        this.health = Math.floor(Math.random() * 50) + 50
        this.damage = 10
        this.defence = 10
        this.keysPressed = new Map<number, boolean>()
    }

    get socket() {
        return this._socket
    }

    setName(name: string) {
        this.name = name
    }

    getName() {
        return this.name
    }

    keyAction(key: number, isDown: boolean) {
        this.keysPressed.set(key, isDown)
    }

    getDamage() {
        return this.damage
    }

    getDefence() {
        return this.defence
    }

    setDamage(damage: number) {
        this.damage += damage
    }

    setDefence(defence: number) {
        this.defence += defence
    }

    getHealth() {
        return this.health
    }

    takeDamage(damage: number) {
        this.health -= damage
    }

    getPlayerDescription() {
        return {
            name: this.name,
            color: this.color,
            position: this.position,
            id: this.socket.id,
            health: this.health
        }
    }

    setHealth(hp: number) {
        this.health = hp
    }

    setPosition(x: number, y: number) {
        this.position.x = x
        this.position.y = y
    }

    getPosition(): Position {
        return {
            x: this.position.x,
            y: this.position.y,
        }
    }

    move(delta: number) {
        if (this.keysPressed.get(this.KEY_A)) {
            this.position.x -= this.MOVEMENT_SPEED * delta
        }
        
        if (this.keysPressed.get(this.KEY_D)) {
            this.position.x += this.MOVEMENT_SPEED * delta
        }
        
        if (this.keysPressed.get(this.KEY_W)) {
            this.position.y -= this.MOVEMENT_SPEED * delta
        }
        
        if (this.keysPressed.get(this.KEY_S)) {
            this.position.y += this.MOVEMENT_SPEED * delta
        }
    }

}