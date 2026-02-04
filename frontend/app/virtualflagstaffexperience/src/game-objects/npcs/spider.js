import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { NPC_CHANGE_DIRECTION_DELAY_MAX, NPC_CHANGE_DIRECTION_DELAY_MIN, NPC_CHANGE_DIRECTION_DELAY_WAIT, NPC_SPEED, } from '../../common/config';
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS, SPIDER_ANIMATION_KEYS } from '../../common/assets';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { DIRECTION } from '../../common/common';

/**
    Spider is a leftover from when this was a tutorial. It shouldn't be used and will either 
    be completly removed or later transitioned into the non-interactable NPC class.
    Right now it remains as an example NPC class.
**/ 
export class Spider extends CharacterGameObject {
    constructor(config){
        // create animation config for the component
        const animconfig = {
            key: SPIDER_ANIMATION_KEYS.WALK, repeat: -1, ignoreIfPlaying: true
        }
        const animationConfig = {
            WALK_UP: animconfig,
            WALK_DOWN: animconfig,
            WALK_LEFT: animconfig,
            WALK_RIGHT: animconfig,

            IDLE_UP: animconfig,
            IDLE_DOWN: animconfig,
            IDLE_LEFT: animconfig,
            IDLE_RIGHT: animconfig,
        }

        super({
            scene: config.scene,
            position: config.position,
            assetKey: ASSET_KEYS.SPIDER,
            frame: 0,
            id: `spider-${Phaser.Math.RND.uuid()}`,
            isPlayer: false,
            animationConfig,
            speed: NPC_SPEED,
            inputComponent: new InputComponent(),
        })

        this._directionComponent.callback = (direction) => {
            this.#handleDirectionChange(direction)
        }

        // add state machine states
        this._stateMachine.addState(new IdleState(this));
        this._stateMachine.addState(new MoveState(this));
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

        this.scene.time.addEvent({
            delay: Phaser.Math.Between(NPC_CHANGE_DIRECTION_DELAY_MIN, NPC_CHANGE_DIRECTION_DELAY_MAX),
            callback: this.#changeDirection,
            callbackScope: this,
            loop: false,
        })
    }

    #handleDirectionChange(direction) {
        switch (direction) {
            case DIRECTION.UP:
                this.setAngle(180);
                break;
            case DIRECTION.LEFT:
                this.setAngle(90);
                break;
            case DIRECTION.DOWN:
                this.setAngle(0);
                break;
            case DIRECTION.RIGHT:
                this.setAngle(270);
                break;
            default:
                exhaustiveGuard(direction);
        }
    }

    #changeDirection() {
        this.controls.reset();

        this.scene.time.delayedCall(NPC_CHANGE_DIRECTION_DELAY_WAIT, () => {
            const randomDirection = Phaser.Math.Between(0, 3);
            switch (randomDirection) {
                case 0:
                    this.controls.isUpDown = true;
                    break;
                case 1:
                    this.controls.isRightDown = true;
                    break;
                case 2:
                    this.controls.isDownDown = true;
                    break;
                case 3:
                    this.controls.isLeftDown = true;
                    break;
            }

            this.scene.time.addEvent({
                delay: Phaser.Math.Between(NPC_CHANGE_DIRECTION_DELAY_MIN, NPC_CHANGE_DIRECTION_DELAY_MAX),
                callback: this.#changeDirection,
                callbackScope: this,
                loop: false,
            })
        })
    }
}