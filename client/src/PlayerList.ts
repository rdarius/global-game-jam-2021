import Player from "./Player";

export default class PlayerList {

    private players: Map<string, Player>

    constructor() {
        this.players = new Map<string, Player>()
    }

    getPlayer(id: string) {
        return this.players.get(id)
    }

    getPlayers() {
        return this.players
    }

    addPlayer(id: string, player: Player) {
        if (this.players.has(id)) return
        this.players.set(id, player)
    }

    removePlayer(id: string) {
        this.players.delete(id)
    }

}