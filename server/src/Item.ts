export default class Item {

    constructor(
        private _image: "healthPack" | "Points",
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