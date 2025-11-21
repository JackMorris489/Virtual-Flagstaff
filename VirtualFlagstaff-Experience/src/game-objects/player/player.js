import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { PLAYER_SPEED } from '../../common/config';
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from '../../common/assets';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { CollidingObjectsComponent } from '../../components/game-object/colliding-objects-component';

export class Player extends CharacterGameObject {
    #collidingObjectsComponent;

    // constructor
    constructor(config){
        // create animation config for the component
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
        this.#collidingObjectsComponent = new CollidingObjectsComponent(this)

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
        this.physicsBody.setSize(12, 16, true).setOffset(this.width/2 - 5, this.height / 2);
    }

    get physicsBody() {
        return this.body;
    }

    collidedWithGameObject(gameObject) {
        this.#collidingObjectsComponent.add(gameObject)
    }

    update() {
        super.update();
        this.#collidingObjectsComponent.reset();
    }
}