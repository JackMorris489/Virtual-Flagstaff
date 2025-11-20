import { PLAYER_ANIMATION_KEYS } from "../../../../common/assets";
import { isArcadePhysicsBody } from "../../../../common/utils"
import { Player  } from "../../../../game-objects/player/player";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";

export class IdleState extends BaseCharacterState {
    constructor(gameObject) {
        super(CHARACTER_STATES.IDLE_STATE, gameObject);
    }

    onEnter() {
        console.log(this._gameObject.direction);
        this._gameObject.animationComponent.playAnimation(`IDLE_${this._gameObject.direction}`);

        if (!isArcadePhysicsBody(this._gameObject.body)) {
            this._gameObject.body.velocity.x = 0;
            this._gameObject.body.velocity.y = 0;
        }
    }

    onUpdate() {
        const controls = this._gameObject.controls;

        // when there's no input, show idle animation
        if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
            return;
        }

        this._stateMachine.setState(CHARACTER_STATES.MOVE_STATE);
    }
}