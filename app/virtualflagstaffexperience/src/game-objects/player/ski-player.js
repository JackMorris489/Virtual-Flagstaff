import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { SKI_SPEED } from '../../common/config';
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from '../../common/assets';
import { InputComponent } from '../../components/input/input-component';
import { SKI_CHARACTER_STATES } from '../../components/state-machine/states/ski-game/ski-character-states';
import { SkiIdleState } from '../../components/state-machine/states/ski-game/ski-idle-state';
import { SkiMoveState } from '../../components/state-machine/states/ski-game/ski-move-state';
import { CollidingObjectsComponent } from '../../components/game-object/colliding-objects-component';
import { InteractingObjectComponent } from '../../components/game-object/interacting-object-component';


export class SkiPlayer extends CharacterGameObject {
    interactingObjectComponent;
    skiAcceleration;

    // constructor
    constructor(config){
        // create animation config for the component
        super({
            scene: config.scene,
            position: config.position,
            frame: 0,
            id: 'ski-player',
            isPlayer: true,
            speed: SKI_SPEED,
            inputComponent: config.controls,
            assetKey: config.assetKey,
        })

        // add components
        this.interactingObjectComponent = new InteractingObjectComponent(this);

        // add state machine states
        this._stateMachine.addState(new SkiIdleState(this));
        this._stateMachine.addState(new SkiMoveState(this));
        this._stateMachine.setState(SKI_CHARACTER_STATES.SKI_IDLE_STATE);

        // auto update
        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });

        // update the size of the physics body
        this.physicsBody.setSize(18, 32, true).setOffset(this.width/2 - 8, this.height/2 - 7);

        // TODO: Update inital gravity acceleration (if possible)
        // add gravity
        this.body.gravity.y = 15;
    }

    get physicsBody() {
        return this.body;
    }

    interactedWithGameObject(gameObject) {
        this.interactingObjectComponent.set(gameObject)
    }

    get interactedObject() {
        return this.interactingObjectComponent.object;
    }

    update() {
        super.update();
    }
}