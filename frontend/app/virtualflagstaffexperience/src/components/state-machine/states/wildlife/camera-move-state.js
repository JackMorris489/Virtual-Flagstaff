import { PLAYER_ANIMATION_KEYS } from "../../../../common/assets";
import { DIRECTION, INTERACTIVE_OBJECT_TYPE } from "../../../../common/common";
import { isArcadePhysicsBody } from "../../../../common/utils"
import { CollidingObjectsComponent } from "../../../game-object/colliding-objects-component";
import { InteractiveObjectComponent } from "../../../game-object/interactive-object-component";
import { CameraBaseCharacterState } from "./base-camera-character-state";
import { CAMERA_CHARACTER_STATES } from "./camera-character-states";

export class CameraMoveState extends CameraBaseCharacterState {
    constructor(gameObject) {
        super(CAMERA_CHARACTER_STATES.CAMERA_MOVE_STATE, gameObject);
    }

    onUpdate() {
        const controls = this._gameObject.controls;

        // when there's no input, set to idle state
        if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
            this._stateMachine.setState(CAMERA_CHARACTER_STATES.CAMERA_IDLE_STATE);
        }
        
        if (controls.isUpDown && !controls.isFrozen) {
            if (this._gameObject._isPlayer && this._gameObject.body.touching.up) {
                this.#updateVelocity(false, 0);
                return;
            }
            this.#updateVelocity(false, -1);
        } 
        else if (controls.isDownDown && !controls.isFrozen) {
            if (this._gameObject._isPlayer && this._gameObject.body.touching.down) {
                this.#updateVelocity(false, 0);
                return;
            }
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
            this.#updateVelocity(true, -1);
        }
        else if (controls.isRightDown && !controls.isFrozen) {
            if (this._gameObject._isPlayer && this._gameObject.body.touching.right) {
                this.#updateVelocity(true, 0);
                return;
            }
            this.#updateVelocity(true, 1);
        } 
        else {
            this.#updateVelocity(true, 0);
        }

        this.#normalizeVelocity();
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