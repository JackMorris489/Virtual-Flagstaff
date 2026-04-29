import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { CAMERA_SPEED, PLAYER_SPEED } from '../../common/config';
import { ASSET_KEYS } from '../../common/assets';
import { InputComponent } from '../../components/input/input-component';
import { CollidingObjectsComponent } from '../../components/game-object/colliding-objects-component';
import { InteractingObjectsComponent } from '../../components/game-object/interacting-objects-component';
import { EVENT_BUS } from '../../common/event-bus';
import apiFetch from '../../../../utils/apiFetch';
import { CameraIdleState } from '../../components/state-machine/states/wildlife/camera-idle-state';
import { CameraMoveState } from '../../components/state-machine/states/wildlife/camera-move-state';
import { CAMERA_CHARACTER_STATES } from '../../components/state-machine/states/wildlife/camera-character-states';

/**
    The overworld player character. This player class handles the animations, 
    state machine, and interacted object for the player character in the overworld.
**/
export class WildlifePlayer extends CharacterGameObject {
    interactingObjectsComponent;
    #currentNearbyObject = null;

    constructor(config){
        // player construction
        super({
            scene: config.scene,
            position: config.position,
            assetKey: ASSET_KEYS.CAMERA_PLAYER,
            frame: 0,
            id: 'wildlife-camera',
            isPlayer: true,
            speed: CAMERA_SPEED,
            inputComponent: config.controls,
        })

        // add components
        this.interactingObjectsComponent = new InteractingObjectsComponent(this);

        // add state machine states
        this._stateMachine.addState(new CameraIdleState(this));
        this._stateMachine.addState(new CameraMoveState(this));
        this._stateMachine.setState(CAMERA_CHARACTER_STATES.CAMERA_IDLE_STATE);

        // auto update
        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });

        // update the size of the physics body
        this.physicsBody.setSize(512/2, 464/2, true);
    }

    get physicsBody() {
        return this.body;
    }

    update() {
        super.update();
    }

    interactedWithGameObject(gameObject) {
        this.interactingObjectsComponent.add(gameObject);
    }

    get interactedObjects() {
        return this.interactingObjectsComponent.allObjects;
    }

    interact() {
        // decrement the photos value
        this.scene.photos --;

        // take the photo
        this.scene.takePhoto();

        if (this.scene.photos <= 0) {
            this.scene.endGame();
        }
    }

    isMoving()
    {
        return this._stateMachine.currentState instanceof MoveState;
    }
}
