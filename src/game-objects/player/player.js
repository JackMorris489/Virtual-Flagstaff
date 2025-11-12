import * as Phaser from 'phaser'
import { PLAYER_ANIMATION_KEYS } from '../../common/assets';
import { ControlsComponent } from '../../components/game-object/controls-component';
import { StateMachine } from '../../components/state-machine/state-machine';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';

export class Player extends Phaser.Physics.Arcade.Sprite {
    #controlsComponent;
    #stateMachine;

    constructor(config){
        const { scene, position, assetKey, frame } = config;
        const { x, y } = position;
        super(scene, x, y, assetKey, frame || 0);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.#controlsComponent = new ControlsComponent(this, config.controls);

        this.play({ key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1 })

        this.#stateMachine = new StateMachine('player');
        this.#stateMachine.addState(new IdleState(this));
        this.#stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });
    };

    get controls() {
        return this.#controlsComponent.controls;
    }

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

        this.#normalizeVelocity();
        this.#stateMachine.update();
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



// https://youtu.be/B5XrPPNZ3cU?si=eY2dnE5FzBx4TeG6&t=4552 CURRENT STEPS