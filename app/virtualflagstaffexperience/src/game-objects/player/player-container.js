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
    Container made to hold the overworld player and the player's interaction zone. 
    The container is in charge of making sure the interaction zone stays with the player.
**/
export class PlayerContainer extends Phaser.GameObjects.Container {
    // constructor
    constructor(config){
        super(
            config.scene,
            config.x,
            config.y,
            config.children
        )

        config.scene.add.existing(this);
    }

    moveInteractZone() {
        // check the player's direction
        switch (this.first.direction) {
            case 'UP':
                // adjust the dimensions of the interaction zone
                this.last.setSize(8, 10, false);

                // move the interaction zone to the player's location
                this.last.x = this.first.x + 4.5;
                this.last.y = this.first.y - this.last.body.height;
                break;

            case 'DOWN':
                // adjust the dimensions of the interaction zone
                this.last.setSize(8, 10, false);

                // move the interaction zone to the player's location
                this.last.x = this.first.x + 4.5;
                this.last.y = this.first.y + this.first.body.height;
                break;

            case 'LEFT':
                // adjust the dimensions of the interaction zone
                this.last.setSize(10, 12, false);

                // move the interaction zone to the player's location
                this.last.x = this.first.x - this.last.body.width;
                this.last.y = this.first.y + 5.5;
                break;

            case 'RIGHT':
                // adjust the dimensions of the interaction zone
                this.last.setSize(10, 12, false);

                // move the interaction zone to the player's location
                this.last.x = this.first.x + this.first.body.width;
                this.last.y = this.first.y + 5.5;
                break;
        }
    }

    update() {
        super.update();
    }
}