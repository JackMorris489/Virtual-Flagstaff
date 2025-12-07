import { PLAYER_ANIMATION_KEYS } from "../../../../common/assets";
import { DIRECTION, INTERACTIVE_OBJECT_TYPE } from "../../../../common/common";
import { isArcadePhysicsBody } from "../../../../common/utils"
import { CollidingObjectsComponent } from "../../../game-object/colliding-objects-component";
import { InteractiveObjectComponent } from "../../../game-object/interactive-object-component";
import { BaseCharacterState } from "./base-character-state";
import { CHARACTER_STATES } from "./character-states";

export class MoveState extends BaseCharacterState {
    constructor(gameObject) {
        super(CHARACTER_STATES.MOVE_STATE, gameObject);
    }

    onUpdate() {
        const controls = this._gameObject.controls;

        // when there's no input, set to idle state
        if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
            this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
        }

        if (controls.isUpDown && !controls.isFrozen) {
            if (this._gameObject._isPlayer && this._gameObject.body.touching.up) {
                this.#updateVelocity(false, 0);
                return;
            }
            this.#updateDirection(DIRECTION.UP);
            this.#updateVelocity(false, -1);
        } 
        else if (controls.isDownDown && !controls.isFrozen) {
            if (this._gameObject._isPlayer && this._gameObject.body.touching.down) {
                this.#updateVelocity(false, 0);
                return;
            }
            this.#updateDirection(DIRECTION.DOWN);
            this.#updateVelocity(false, 1);
        } 
        else {
            this.#updateVelocity(false, 0);
        }

        const isMovingVertically = controls.isDownDown || controls.isUpDown;

        if (controls.isLeftDown && !controls.isFrozen) {
            if (this._gameObject._isPlayer && this._gameObject.body.touching.left) {
                this.#updateVelocity(true, 0);
                return;
            }
            if(!isMovingVertically) {
                this.#updateDirection(DIRECTION.LEFT);
            }
            this._gameObject.setFlipX(true);
            this.#updateVelocity(true, -1);
        }
        else if (controls.isRightDown && !controls.isFrozen) {
            if (this._gameObject._isPlayer && this._gameObject.body.touching.right) {
                this.#updateVelocity(true, 0);
                return;
            }
            if(!isMovingVertically) {
                this.#updateDirection(DIRECTION.RIGHT);
            }
            this._gameObject.setFlipX(false);
            this.#updateVelocity(true, 1);
        } 
        else {
            this.#updateVelocity(true, 0);
        }

        this.#normalizeVelocity();
    }

    // set the direction
    #updateDirection(direction) {
        this._gameObject.direction = direction;
        this._gameObject.animationComponent.playAnimation(`WALK_${this._gameObject.direction}`)
    }

    // update the object's velocity
    #updateVelocity(isX, value) {
        if (!isArcadePhysicsBody(this._gameObject.body)) {
            return;
        }
        if (isX) {
            this._gameObject.body.velocity.x = value;
            return;
        }
        this._gameObject.body.velocity.y = value;
    }

    // normalize the object's velocity
    #normalizeVelocity() {
        if (!isArcadePhysicsBody(this._gameObject.body)) {
            return;
        }

        this._gameObject.body.velocity.normalize().scale(this._gameObject.speed);
    }
}