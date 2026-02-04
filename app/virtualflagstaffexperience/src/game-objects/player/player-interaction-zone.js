import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { PLAYER_SPEED } from '../../common/config';
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS } from '../../common/assets';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { CollidingObjectsComponent } from '../../components/game-object/colliding-objects-component';

/**
    Invisable physics object made to stay in front of the player in order to detect when the player
    is facing and next to an interactable object.
**/
export class PlayerInteractionZone extends CharacterGameObject {
    #collidingObjectsComponent;

    // constructor
    constructor(config){
        super({
            scene: config.scene,
            position: config.position,
            id: 'playerinteractionzone',
        })

        // add components
        this.#collidingObjectsComponent = new CollidingObjectsComponent(this)

        // update the size of the physics body
        this.physicsBody.setSize(8, 10, true).setOffset(this.width/2 - 8, this.height/2 - 7);
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