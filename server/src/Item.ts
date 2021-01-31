export default class Item {

    constructor(
        private _image: "healthPack",
        private _type: "HEAL" | "DAMAGE" | "DEFENCE"
    ) {

    }

    get image() {
        return this._image
    }

    get type() {
        return this._type
    }

}