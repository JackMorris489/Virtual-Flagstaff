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
import { CUSTOM_EVENTS, EVENT_BUS } from '../../common/event-bus';
import apiFetch from "../../../../utils/apiFetch"


/**
    Interactive NPC class, this class exists essentially as an extention (perhaps later literally)
    of the base NPC class. This one has additional code to allow it to be interacted with.
**/ 
// TODO: OVERHAUL AND MAKE IT EXTEND THE BASE NPC CLASS
export class InteractiveNPC extends CharacterGameObject {
    interactionType;
    interactionComponent;

    constructor(config, name, questId) {
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
            animationConfig,
            frame: 0,
            id: `${config.id}`,
            inputComponent: new InputComponent(),
            speed: NPC_SPEED,
            isPlayer: false
        })

        this.interactionType = config.interactionType;
        this.name = name;
        this.id = config.id;
        this.questId = questId

        // add components
        this.interactionComponent = new InteractiveObjectComponent(
            this, 
            INTERACTIVE_OBJECT_TYPE[this.interactionType], () => {
                // check the interaction type
                switch (this.interactionComponent.objectType) {
                    case 'DIALOG':
                        this.dialog();
                        break;
                }
            }
        );

        // add state machine states
        this._stateMachine.addState(new IdleState(this));
        this._stateMachine.addState(new MoveState(this));
        this._stateMachine.setState(CHARACTER_STATES.IDLE_STATE);
    }

    freeze()
    {
        this.scene.controls.isFrozen = true;
    }

    unfreeze()
    {
        this.scene.controls.isFrozen = false;
    }

    async get_current_dialog()
    {
        const dialogs = NPC_DIALOG[this.name];
        const index = this.scene.currentDialogNumber;

        if (index === 0)
        {
            try
            {
                const data = await apiFetch(`/users/me/quests/${this.questId}`, {
                    method: "GET",
                    credentials: "include",
                    headers: {"Content-Type": "application/json"}
                });

                if (data.is_complete)
                {
                    console.log("Use quest completion dialog")
                }

                else
                {
                    console.log("Use quest in progress dialog")
                }
            }

            catch (e) {
                console.error(e)
                if (e.status === 404)
                {
                    console.log("Use quest assigning dialog")
                }
            }
        }

        return dialogs[index];
    }

    async getQuest()
    {
        return await apiFetch(`/users/me/quests/${this.questId}`, {
            method: "POST",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
        });
    }

    async dialog() {

        const dialog = await this.get_current_dialog();

        if (dialog) 
        {
            this.freeze()

            // emit dialog through the event bus
            EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_DIALOG, dialog);

            // increment the current dialog
            this.scene.currentDialogNumber++;
        }
        
        else
        {
            // reset the dialog counter, close dialog and unfreeze the user
            EVENT_BUS.emit(CUSTOM_EVENTS.CLOSE_DIALOG);
            this.scene.currentDialogNumber = 0;
            this.unfreeze();
            try
            {
                const quest = getQuest();

                EVENT_BUS.emit(CUSTOM_EVENTS.REFRESH_QUESTS)
            }

            catch (e) {
                throw e
            }

        }
    }
}