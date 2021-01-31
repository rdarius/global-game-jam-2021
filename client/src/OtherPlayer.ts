import p5 from "p5"
import Bullet from "./Bullet"
import { Position } from "./types"

export default class OtherPlayer {

    private PLAYER_SPEED = 1
    private KEY_W = 87;
    private KEY_A = 65;
    private KEY_S = 83;
    private KEY_D = 68;

    private bullets: Bullet[] = []
    private _damage: number
    private _defence: number

    constructor(
        private _id: string,
        private _name: string,
        private _position: Position,
        private _color: string,
        private _keysPressed: Map<number, boolean>,
        private _health: number
    ) {
        this._damage = 10
        this._defence = 0
    }

    hit(bullet: Bullet, socket: SocketIOClient.Socket) {
        bullet.timeToLive = -1
        socket.emit('hit-player', {player: this.id, damage: bullet.shooter.damage})
    }

    addBullet(bullet: Bullet) {
        this.bullets.push(bullet)
    }

    getBullets() {
        return this.bullets
    }

    removeExpiredBullets() {
        this.bullets = this.bullets.filter((bullet) => {
            return bullet.timeToLive > 0
        })
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

    draw(p5: p5, position: Position) {
        p5.stroke(0, 0, 0)
        p5.strokeWeight(2)
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

    get health() {
        return this._health
    }

    set health(hp: number) {
        this._health = hp
    }

    get damage() {
        return this._damage
    }

    set damage(dmg: number) {
        this._damage = dmg
    }

    get defence() {
        return this._defence
    }

    set defence(def: number) {
        this._defence = def
    }

    get id(): string {
        return this._id
    }

    set id(id: string) {
        this._id = id
    }

    get position(): Position {
        return this._position
    }

    set position(position: Position) {
        this._position = position
    }

    get name(): string {
        return this._name
    }

    set name(name: string) {
        this._name = name
    }

    get color(): string {
        return this._color
    }

    set color(color: string) {
        this._color = color
    }

    move(delta: number) {
        let previousPosition = {
            x: this.position.x,
            y: this.position.y,
        }
        if (this.keyPressed(this.KEY_A)) {
            this.position.x -= this.PLAYER_SPEED * delta;
        }
        if (this.keyPressed(this.KEY_D)) {
            this.position.x += this.PLAYER_SPEED * delta;
        }
    
        if (this.keyPressed(this.KEY_W)) {
            this.position.y -= this.PLAYER_SPEED * delta;
        }
        if (this.keyPressed(this.KEY_S)) {
            this.position.y += this.PLAYER_SPEED * delta;
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

        // if (this.position.x !== previousPosition.x || this.position.y !== previousPosition.y) {
        //     this.socket.emit('i-moved', {x: this.position.x, y: this.position.y})
        // }
    }

}