import Item from "./Item";
import { Position } from "./types";

export default class Pickable {

    constructor(
        private _id: string,
        private _position: Position,
        private _item: Item,
    ) {

    }

    get id() {
        return this._id
    }

    get position() {
        return this._position
    }

    get item() {
        return this._item
    }


}