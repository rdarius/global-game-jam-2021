import p5 from "p5";

export default class Item {

    constructor(
        private _image: p5.Image,
        private _type: "HEAL" | "DAMAGE" | "DEFENCE" | "POINTS"
    ) {

    }

    get image() {
        return this._image
    }

    get type() {
        return this._type
    }

}