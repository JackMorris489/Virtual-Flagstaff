import * as Phaser from 'phaser'
import { PLAYER_ANIMATION_KEYS } from '../../common/assets';
import { ControlsComponent } from '../../components/input/game-object/controls-component';

export class Player extends Phaser.Physics.Arcade.Sprite {
    #controlsComponent;

    constructor(config){
        const { scene, position, assetKey, frame } = config;
        const { x, y } = position;
        super(scene, x, y, assetKey, frame || 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.#controlsComponent = new ControlsComponent(this, config.controls);

        this.play({ key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1 })

        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });
    };

    update() {
        const controls = this.#controlsComponent.controls;
        if (controls.isUpDown) {
            this.play({ key: PLAYER_ANIMATION_KEYS.WALK_UP, repeat: -1 }, true);
            this.#updateVelocity(false, -1);
        } 
        else if (controls.isDownDown) {
            this.play({ key: PLAYER_ANIMATION_KEYS.WALK_DOWN, repeat: -1 }, true);
            this.#updateVelocity(false, 1);
        } 
        else {
            this.#updateVelocity(false, 0);
        }

        const isMovingVertically = controls.isDownDown || controls.isUpDown;

        if (controls.isLeftDown) {
            this.setFlipX(true);
            this.#updateVelocity(true, -1);
            if(!isMovingVertically) {
                this.play({ key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1 }, true);
            }
        }
        else if (controls.isRightDown) {
            this.setFlipX(false);
            this.#updateVelocity(true, 1);
            if(!isMovingVertically) {
                this.play({ key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1 }, true);
            }
        } 
        else {
            this.#updateVelocity(true, 0);
        }

        if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
            this.play({ key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1 }, true);
        }

        this.#normalizeVelocity();
    }

    #updateVelocity(isX, value) {
        if (isX) {
            this.body.velocity.x = value;
            return;
        }
        this.body.velocity.y = value;
    }

    #normalizeVelocity() {
        this.body.velocity.normalize().scale(80);
    }
}