import socketIO from 'socket.io'

export default class Player {

    private name: string
    private position: {x: number, y: number}
    private color: string
    private health: number

    constructor(private _socket: socketIO.Socket) {
        this.name = 'Player#' + Math.floor(Math.random() * 10000)
        this.position = {
            x: Math.random()*1000 - 500,
            y: Math.random()*1000 - 500,
        }
        this.color = '#' + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16) + (Math.floor(Math.random() * 256)).toString(16)
        this.health = Math.floor(Math.random() * 50) + 50
    }

    get socket() {
        return this._socket
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

}