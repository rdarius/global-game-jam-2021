import { Position } from './types'
import p5 from 'p5'
import Bullet from './Bullet'

export default class Player {
    
    private KEY_W = 87
    private KEY_A = 65
    private KEY_S = 83
    private KEY_D = 68

    private MOVEMENT_SPEED = 0.8

    private bullets: Bullet[] = []

    constructor(
        private _id: string,
        private _name: string = 'Player',
        private _position: Position = {x: 0, y: 0},
        private _color: string = '#ffffff',
        private _keysPressed: Map<number, boolean> = new Map<number, boolean>(),
        private _health: number = 100,
        private _damage: number = 10,
        private _defence: number = 10,
    ) {
        this._keysPressed = new Map<number, boolean>()
    }

    get keysPressed() {
        return this._keysPressed
    }

    get id() {
        return this._id
    }

    set id(id: string) {
        this._id = id
    }

    get name() {
        return this._name
    }

    set name(name: string) {
        this._name = name
    }

    get position() {
        return this._position
    }

    set position(position: Position) {
        this._position = position
    }

    get color() {
        return this._color
    }

    set color(color: string) {
        this._color = color
    }

    get health() {
        return this._health
    }

    set health(health: number) {
        this._health = health
    }

    get damage() {
        return this._damage
    }

    set damage(damage: number) {
        this._damage = damage
    }

    get defence() {
        return this._defence
    }

    set defence(defence: number) {
        this._defence = defence
    }

    hit(bullet: Bullet, socket: SocketIOClient.Socket) {
        bullet.timeToLive = -1
        let dmg = bullet.shooter.damage - this.defence
        if (dmg < 0) dmg = 0
        this.health -= dmg
        socket.emit('hit-player', {id: this.id, health: this.health})
    }

    keyAction(key: number, isDown: boolean) {
        this._keysPressed.set(key, isDown)
    }

    takeDamage(damage: number) {
        let dmg = damage - this._defence
        if (dmg < 0) { dmg = 0 }
        this._health -= dmg
    }

    getPlayerDescription() {
        return {
            name: this.name,
            color: this.color,
            position: this.position,
            id: this._id,
            health: this.health,
            damage: this.damage,
            defence: this.defence
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
    }

    draw(p5: p5, position: Position) {
        p5.stroke(0, 0, 0)
        p5.strokeWeight(5)
        p5.fill(this.color)
        p5.ellipse(position.x, position.y, 80, 80)
        p5.textSize(32)
        p5.fill(255, 255, 255)
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.text(this.name, position.x - 300, position.y - 150, 600, 50)
        p5.noStroke()
        p5.fill('#850000')
        p5.rect(position.x - 50, position.y - 90, 100, 5)
        p5.fill('#008500')
        p5.rect(position.x - 50, position.y - 90, this.health, 5)
    }

    addBullet(bullet: Bullet) {
        this.bullets.push(bullet)
    }

    getBullets() {
        return this.bullets
    }

    removeExpiredBullets() {
        this.bullets = this.bullets.filter((bullet: Bullet) => {
            return bullet.timeToLive > 0
        })
    }

}