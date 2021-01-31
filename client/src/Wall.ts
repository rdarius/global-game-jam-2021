import p5 from "p5";
import { Position } from "./types";

export default class Wall {

    constructor(
        private _position: Position,
        private _size: Position,
    ) {

    }

    get position() {
        return this._position
    }

    set position(position: Position) {
        this._position = position
    }

    get size() {
        return this._size
    }

    set size(size: Position) {
        this._size = size
    }

    draw(p5: p5, playerPos: Position) {
        p5.fill("#000000")
        p5.rect(this.position.x - playerPos.x, this.position.y - playerPos.y, this.size.x, this.size.y)
    }

}