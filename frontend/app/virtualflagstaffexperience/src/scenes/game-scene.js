import * as Phaser from 'phaser';
import apiFetch from "../../../utils/apiFetch"

export class GameScene extends Phaser.Scene {
    constructor(config) {
        const {sceneKey, gameKey} = config;

        super({
            key: sceneKey,
        });
        this.gameKey = gameKey;
        this.score = 0;
    }

    addScore(points)
    {
        this.score += points
    }

    async submitGameSession()
    {
        try
        {
            const game_session = await apiFetch("/users/me/game-sessions", {
                method: "POST",
                header: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    "game_key": this.gameKey,
                    "score": this.score
                })
            })

            console.log(game_session)
        }
        
        catch (err)
        {
            console.error(err)
        }
    }
}