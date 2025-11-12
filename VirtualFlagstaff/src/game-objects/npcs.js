import * as Phaser from 'phaser'
import { PLAYER_ANIMATION_KEYS } from '../common/assets';

export class NPC extends Phaser.Physics.Arcade.Sprite {

    constructor(config){
        const { scene, position, assetKey, frame } = config;
        const { x, y } = position;
        super(scene, x, y, assetKey, frame || 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.play({ key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1 })

        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });
    };

    update() {
        this.npcMove();
    }

    npcMove() {
        const randomNumber = Phaser.Math.RND.integer;
        const expression = randomNumber % 5;

        switch (expression) {
            case (expression == 1):
                // Move at 200 px/s:
                this.body.velocity.y = 10;
                break;

            case (expression == 2):
                // Move at 200 px/s:
                this.body.velocity.y = 10;
                break;

            case (expression == 3):
                // Move at 200 px/s:
                this.body.velocity.y = 10;
                break;

            case (expression == 4):
                // Move at 200 px/s:
                this.body.velocity.y = 10;
                break;

            default:
                // Move at 200 px/s:
                this.body.velocity.y = 10;
                break;
        }
    }
}