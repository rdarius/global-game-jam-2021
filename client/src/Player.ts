import { Position } from './types'
import p5 from 'p5'
import Bullet from './Bullet'
import Wall from './Wall'
import { collideRectCircle } from './collide'

export default class Player {
    
    private KEY_W = 87
    private KEY_A = 65
    private KEY_S = 83
    private KEY_D = 68

    private MOVEMENT_SPEED = 0.8
    private PLAYER_SIZE = 80
    private BULLET_SIZE = 30
    private ITEM_SIZE = 64

    private _score = 0

    private bullets: Bullet[] = []

    constructor(
        private _id: string,
        private _name: string = 'Player',
        private _position: Position = {x: 0, y: 0},
        private _color: string = '#690000',
        private _keysPressed: Map<number, boolean> = new Map<number, boolean>(),
        private _health: number = 100,
        private _damage: number = 10,
        private _defence: number = 10,
    ) {
        this._keysPressed = new Map<number, boolean>()
    }

    get score() {
        return this._score
    }

    set score(score: number) {
        this._score = score
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

    move(p5: p5, delta: number, walls: Wall[]) {
        let direction = {
            x: 0,
            y: 0
        }
        if (this.keysPressed.get(this.KEY_A)) {
            direction.x -= 1
        }
        
        if (this.keysPressed.get(this.KEY_D)) {
            direction.x += 1
        }
        
        if (this.keysPressed.get(this.KEY_W)) {
            direction.y -= 1
        }
        
        if (this.keysPressed.get(this.KEY_S)) {
            direction.y += 1
        }

        let x = this.position.x + this.MOVEMENT_SPEED * delta * direction.x
        let y = this.position.y + this.MOVEMENT_SPEED * delta * direction.y
        let newPos = {
            x: x,
            y: y,
        }
        for (let wall of walls) {
            if (collideRectCircle(p5, wall.position.x, wall.position.y, wall.size.x, wall.size.y, x, this.position.y, this.PLAYER_SIZE)) {
                console.log('collision on x')
                newPos.x = this.position.x
            }
            if (collideRectCircle(p5, wall.position.x, wall.position.y, wall.size.x, wall.size.y, this.position.x, y, this.PLAYER_SIZE)) {
                console.log('collision on y')
                newPos.y = this.position.y
            }
        }

        this.position = newPos
    }

    draw(p5: p5, position: Position) {
        p5.stroke(0, 0, 0)
        p5.strokeWeight(2)
        p5.fill(this.color)
        p5.ellipse(position.x, position.y, this.PLAYER_SIZE, this.PLAYER_SIZE)
        p5.textSize(32)
        p5.fill("#690000")
        p5.textAlign(p5.CENTER, p5.CENTER)
        p5.text(this.name, position.x - 300, position.y - 150, 600, 50)
        p5.strokeWeight(2)
        p5.fill('#690000')
        p5.rect(position.x - 50, position.y - 90, 100, 10)
        p5.fill('#000000')
        p5.rect(position.x - 50, position.y - 90, this.health, 10)
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