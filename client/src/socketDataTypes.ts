import { Position } from "./types"

export type PlayerDescription = {
    name: string,
    color: string,
    position: {
        x: number,
        y: number,
    },
    id: string,
    health: number,
    damage: number,
    defence: number,
    keysPressed: Map<number, boolean>
}

export type BulletData = {
    id: string,
    position: Position,
    direction: Position
}