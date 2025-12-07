import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { NPC_CHANGE_DIRECTION_DELAY_MAX, NPC_CHANGE_DIRECTION_DELAY_MIN, NPC_CHANGE_DIRECTION_DELAY_WAIT, NPC_SPEED, } from '../../common/config';
import { ASSET_KEYS, PLAYER_ANIMATION_KEYS, SPIDER_ANIMATION_KEYS } from '../../common/assets';
import { InputComponent } from '../../components/input/input-component';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { DIRECTION, INTERACTIVE_OBJECT_TYPE } from '../../common/common';
import { InteractiveObjectComponent } from '../../components/game-object/interactive-object-component';
import { NPC_DIALOG } from '../../common/npc-dialog';

export class InteractiveNPC extends CharacterGameObject {
    interactionComponent;

    constructor(config) {
        // create animation config for the component
        const animconfig = {
            key: SPIDER_ANIMATION_KEYS.WALK, repeat: -1, ignoreIfPlaying: true
        }
        const animationConfig = {
            WALK_UP: animconfig,
            WALK_DOWN: animconfig,
            WALK_LEFT: animconfig,
            WALK_RIGHT: animconfig,

            IDLE_UP: animconfig,
            IDLE_DOWN: animconfig,
            IDLE_LEFT: animconfig,
            IDLE_RIGHT: animconfig,
        }

        super({
            scene: config.scene,
            position: config.position,
            assetKey: ASSET_KEYS.SPIDER,
            frame: 0,
            id: `interactive-${config.count}`,
            isPlayer: false,
            animationConfig,
            speed: NPC_SPEED,
            inputComponent: new InputComponent(),
        })

        // add components
        this.interactionComponent = new InteractiveObjectComponent(this, INTERACTIVE_OBJECT_TYPE.DIALOG, () => {
            openDialog(NPC_DIALOG.DIALOG_1_1);
        });

        // add state machine states
        this._stateMachine.addState(new IdleState(this));
        this._stateMachine.addState(new MoveState(this));
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    }
}