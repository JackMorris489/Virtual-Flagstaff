import { PLAYER_ANIMATION_KEYS } from "../../../../common/assets";
import { ENABLE_LOGGING } from "../../../../common/config";
import { isArcadePhysicsBody } from "../../../../common/utils"
import { SkiBaseCharacterState } from "./base-ski-character-state";
import { SKI_CHARACTER_STATES } from "./ski-character-states";

export class SkiIdleState extends SkiBaseCharacterState {
    constructor(gameObject) {
        super(SKI_CHARACTER_STATES.SKI_IDLE_STATE, gameObject);
    }

    onEnter() {
        if (ENABLE_LOGGING) {
            console.log(this._gameObject.direction);
        }
//        this._gameObject.animationComponent.playAnimation(`IDLE_DOWN`);

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

        this._stateMachine.setState(SKI_CHARACTER_STATES.SKI_MOVE_STATE);
    }
}