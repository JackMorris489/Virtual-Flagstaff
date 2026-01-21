import { PLAYER_ANIMATION_KEYS } from "../../../../common/assets";
import { DIRECTION, INTERACTIVE_OBJECT_TYPE } from "../../../../common/common";
import { isArcadePhysicsBody } from "../../../../common/utils"
import { CollidingObjectsComponent } from "../../../game-object/colliding-objects-component";
import { InteractiveObjectComponent } from "../../../game-object/interactive-object-component";
import { SkiBaseCharacterState } from "./base-ski-character-state";
import { SKI_CHARACTER_STATES } from "./ski-character-states";

export class SkiMoveState extends SkiBaseCharacterState {
    constructor(gameObject) {
        super(SKI_CHARACTER_STATES.SKI_MOVE_STATE, gameObject);
    }

    onUpdate() {
        const controls = this._gameObject.controls;

        // when there's no input, set to idle state
        if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
            this._stateMachine.setState(SKI_CHARACTER_STATES.SKI_IDLE_STATE);
        }
        
        if (controls.isLeftDown && !controls.isFrozen) {
            this.#updateDirection(DIRECTION.LEFT);
            this._gameObject.setFlipX(false);
            this.#updateVelocity(-1);
        }
        else if (controls.isRightDown && !controls.isFrozen) {
            this.#updateDirection(DIRECTION.RIGHT);
            this._gameObject.setFlipX(true);
            this.#updateVelocity(1);
        } 
        else {
            this.#updateVelocity(0);
        }
    }

    // set the direction
    #updateDirection(direction) {
        this._gameObject.direction = direction;
//        this._gameObject.animationComponent.playAnimation(`WALK_${this._gameObject.direction}`)
    }

    // update the object's velocity
    #updateVelocity(value) {
        if (!isArcadePhysicsBody(this._gameObject.body)) {
            return;
        }
        this._gameObject.body.velocity.x = this._gameObject.speed * value;
        return;
    }
}