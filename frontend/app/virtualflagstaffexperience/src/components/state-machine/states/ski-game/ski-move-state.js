import { PLAYER_ANIMATION_KEYS } from "../../../../common/assets";
import { DIRECTION, INTERACTIVE_OBJECT_TYPE } from "../../../../common/common";
import { SKI_MAX_Y, SKI_MAX_X } from "../../../../common/config";
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
        
        // up key reduces speed
        if (controls.isUpDown && !controls.isFrozen) {
            this.#updateDirection(DIRECTION.UP);
            this.#updateVelocity(false, -0.75);
        } 
        // down key increases speed
        else if (controls.isDownDown && !controls.isFrozen) {
            this.#updateDirection(DIRECTION.DOWN);
            this.#updateVelocity(false, 0.5);
        }

        // horizontal controls
        if (controls.isLeftDown && !controls.isFrozen) {
            this.#updateDirection(DIRECTION.LEFT);
            this.#updateVelocity(true, -1.15);
            this.#updateAnimation();
        }
        else if (controls.isRightDown && !controls.isFrozen) {
            this.#updateDirection(DIRECTION.RIGHT);
            this.#updateVelocity(true, 1.15);
            this.#updateAnimation();
        } 
        else {
            this.#updateVelocity(true, 0);
        }
    }

    // set the player's direction
    #updateDirection(direction) {
        this._gameObject.direction = direction;
    }

    // update the object's velocity
    #updateVelocity(isX, value) {
        if (!isArcadePhysicsBody(this._gameObject.body)) {
            return;
        }

        // update x velocity
        if (isX) {
            this._gameObject.body.velocity.x += this._gameObject.speed * value;
            return;
        }
        // update y velocity
        this._gameObject.body.velocity.y += this._gameObject.speed * value;

        // ensure players can't go up
        if (this._gameObject.body.velocity.y < 0) {
            this._gameObject.body.velocity.y = 0;
        }
    }

    #updateAnimation() {
        // update the animation according when the player is moving left or right
        if (this._gameObject.body.velocity.x < 0) {
            this._gameObject.setFlipX(false);
        }
        else if (this._gameObject.body.velocity.x > 0) {
            this._gameObject.setFlipX(true);
        }
    }
}