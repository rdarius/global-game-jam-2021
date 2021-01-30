import p5 from "p5";
import { Position } from "./types";

export default class MapTile {

    constructor(private _image: p5.Image, private _position: Position) {

    }

    get image() {
        return this._image
    }

    get position() {
        return this._position
    }

}