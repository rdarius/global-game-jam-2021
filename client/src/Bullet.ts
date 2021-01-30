import p5 from "p5";
import OtherPlayer from "./OtherPlayer";
import { Position } from "./types";

export default class Bullet {

    private timeLeftToLive = 2000;

    private _position: Position

    constructor(
        private _shooter: OtherPlayer,
        private direction: Position,
    ) {
        this._position = {..._shooter.position}
    }

    get position() {
        return this._position
    }

    get shooter() {
        return this._shooter
    }

    draw(p5: p5, position: Position) {
        p5.stroke(0, 0, 0)
        p5.strokeWeight(3)
        p5.fill(this._shooter.color)
        p5.ellipse(position.x, position.y, 30, 30)
    }

    move(delta: number) {
        this._position.x += this.direction.x * delta
        this._position.y += this.direction.y * delta

        this.timeLeftToLive -= Math.abs(this.direction.x) + Math.abs(this.direction.y)
    }

    get timeToLive() {
        return this.timeLeftToLive
    }

    set timeToLive(time: number) {
        this.timeLeftToLive = time
    } 

}