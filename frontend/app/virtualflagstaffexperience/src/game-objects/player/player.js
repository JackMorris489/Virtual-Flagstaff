import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { PLAYER_SPEED } from '../../common/config';
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from '../../common/assets';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { CollidingObjectsComponent } from '../../components/game-object/colliding-objects-component';
import { InteractingObjectComponent } from '../../components/game-object/interacting-object-component';
import { EVENT_BUS } from '../../common/event-bus';

/**
    The overworld player character. This player class handles the animations, 
    state machine, and interacted object for the player character in the overworld.
**/
export class Player extends CharacterGameObject {
    interactingObjectComponent;
    #hasMoved = false;
    #currentNearbyObject = null;

    constructor(config){
        // create the animation config for the component
        const animationConfig = {
            // walking animations
            WALK_UP: {key: PLAYER_ANIMATION_KEYS.WALK_UP, repeat: -1, ignoreIfPlaying: true},
            WALK_DOWN: {key: PLAYER_ANIMATION_KEYS.WALK_DOWN, repeat: -1, ignoreIfPlaying: true},
            WALK_LEFT: {key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1, ignoreIfPlaying: true},
            WALK_RIGHT: {key: PLAYER_ANIMATION_KEYS.WALK_SIDE, repeat: -1, ignoreIfPlaying: true},

            // idle animations
            IDLE_UP: {key: PLAYER_ANIMATION_KEYS.IDLE_UP, repeat: -1, ignoreIfPlaying: true},
            IDLE_DOWN: {key: PLAYER_ANIMATION_KEYS.IDLE_DOWN, repeat: -1, ignoreIfPlaying: true},
            IDLE_LEFT: {key: PLAYER_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true},
            IDLE_RIGHT: {key: PLAYER_ANIMATION_KEYS.IDLE_SIDE, repeat: -1, ignoreIfPlaying: true},
        }

        // player construction
        super({
            scene: config.scene,
            position: config.position,
            assetKey: ASSET_KEYS.PLAYER,
            frame: 0,
            id: 'player',
            isPlayer: true,
            animationConfig,
            speed: PLAYER_SPEED,
            inputComponent: config.controls,
        })

        // add components
        this.interactingObjectComponent = new InteractingObjectComponent(this);

        // add state machine states
        this._stateMachine.addState(new IdleState(this));
        this._stateMachine.addState(new MoveState(this));
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);

        // auto update
        config.scene.events.on(Phaser.Scenes.Events.UPDATE, this.update, this);
        config.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            config.scene.events.off(Phaser.Scenes.Events.UPDATE, this.update, this);
        });

        // update the size of the physics body
        this.physicsBody.setSize(18, 22, true).setOffset(this.width/2 - 8, this.height/2 - 7);
    }

    get physicsBody() {
        return this.body;
    }

    closeToGameObject(gameObject){
        if(this.#currentNearbyObject == gameObject) {
            return;
        }
        this.#currentNearbyObject = gameObject;
        if(gameObject && gameObject.interactionComponent) {
            EVENT_BUS.emit('PLAYER_INTERACTION_CLOSE', gameObject.interactionComponent.type);
        }
    }

    // not confident what the logic here should be
    gameObjectGone(){
        if (this.#currentNearbyObject)
        {
            // this.#currentNearbyObject = null;
            // EVENT_BUS.emit('PLAYER_INTERACTION_GONE');
        }
    }
    
    interactedWithGameObject(gameObject) {
        this.interactingObjectComponent.set(gameObject);
    }

    get interactedObject() {
        return this.interactingObjectComponent.object;
    }

    interact() {
        // confirm the object can be interacted with
        if (this.interactedObject.interactionComponent.canInteractWith()) {
            // run interaction
            this.interactedObject.interactionComponent.runInteract();
        }
    }

    update() {
        super.update();

        if (
            !this.#hasMoved && 
            this._stateMachine.isCurrentStateMoving('MOVE_STATE')
        )
        {
            this.#hasMoved = true;
            EVENT_BUS.emit('PLAYER_MOVED');
        }
    }
}
