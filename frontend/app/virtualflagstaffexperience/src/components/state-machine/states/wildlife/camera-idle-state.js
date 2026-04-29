import { ENABLE_LOGGING } from "../../../../common/config";
import { isArcadePhysicsBody } from "../../../../common/utils"
import { CameraBaseCharacterState } from "./base-camera-character-state";
import { CAMERA_CHARACTER_STATES } from "./camera-character-states";

export class CameraIdleState extends CameraBaseCharacterState {
    constructor(gameObject) {
        super(CAMERA_CHARACTER_STATES.CAMERA_IDLE_STATE, gameObject);
    }

    onEnter() {
        if (ENABLE_LOGGING) {
            console.log(this._gameObject.direction);
        }

        if (!isArcadePhysicsBody(this._gameObject.body)) {
            this._gameObject.body.velocity.x = 0;
            this._gameObject.body.velocity.y = 0;
        }
    }

    onUpdate() {
        const controls = this._gameObject.controls;
    
        if (!controls.isDownDown && !controls.isUpDown && !controls.isLeftDown && !controls.isRightDown) {
            return;
        }
    
        this._stateMachine.setState(CAMERA_CHARACTER_STATES.CAMERA_MOVE_STATE);
    }
}