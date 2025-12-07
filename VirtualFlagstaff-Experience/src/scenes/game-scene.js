import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/npcs/spider';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { InteractiveNPC } from '../game-objects/npcs/interactable-npc';
import { PlayerContainer } from '../game-objects/player/player-container';
import { PlayerInteractionZone } from '../game-objects/player/player-interaction-zone';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { NPC_DIALOG } from '../common/npc-dialog';

export class GameScene extends Phaser.Scene {
    #controls;
    #playerContainer;
    #playerInteractionZone;
    #player;
    #npcGroup;
    #interactiveNPCGroup;
    #spider;
    #spider2;
    #interactiveSpider;
    #currentDialogNumber;

    constructor() {
        super({
            key: SCENE_KEYS.GAME_SCENE,
        });
    }

    create() {
        this.add
            .text(this.scale.width / 2, this.scale.height /2, 'GAME SCENE', { fontFamily: ASSET_KEYS.FONT_PRESS_START_2P })
            .setOrigin(0.5);

        // check if keyboard is avalible
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);
        

        // create player
        this.#player = new Player({
            scene: this,
            position: {x: this.scale.width/2, y: this.scale.height/2},
            controls: this.#controls,
        })

        this.#playerInteractionZone = new PlayerInteractionZone({
            scene: this,
            position: {x: 0, y: 0},
        })


        this.#playerContainer = new PlayerContainer({
            scene: this,
            x: 0, 
            y: 0,
            children: [this.#player, this.#playerInteractionZone],
        })

        // create the npc group
        this.#npcGroup = this.add.group([
            // create an NPC (spider)
            this.#spider = new Spider({
                scene: this,
                position: {x: this.scale.width/2, y: this.scale.height/2 + 50},
            }),
            // create an NPC (spider)
            this.#spider2 = new Spider({
                scene: this,
                position: {x: this.scale.width/2, y: this.scale.height/2 + 50},
            }),
        ], {
            runChildUpdate: true
        })

        // create the interactable npc group
        this.#interactiveNPCGroup = this.add.group([
            // create an interactable npc
            this.#interactiveSpider = new InteractiveNPC({
                scene: this,
                position: {x: this.scale.width/2, y: this.scale.height/2 - 100},
                count: 1,
            }),
        ], {
            runChildUpdate: true
        })

        this.#registerColiders();
        this.#registerCustomEvents();

        this.scene.launch(SCENE_KEYS.UI_SCENE)
    };

    update() {
        this.#playerContainer.moveInteractZone();
        if(this.#controls.isEnterJustDown && this.#controls.isFrozen) {
            this.#continueDialog(this.#currentDialogNumber);
        }
    }


    #collideObjects() {
        this.#player.setVelocityX(0);
        this.#player.setVelocityY(0);
    }

    #registerColiders() {
        // regular npc group colliders
        this.#npcGroup.getChildren().forEach((npc) => {
            npc.setCollideWorldBounds(true);
            this.physics.add.collider(this.#player, npc, this.#collideObjects, null, this)
        });
        
        // interactive npc group colliders
        this.#interactiveNPCGroup.getChildren().forEach((npc) => {
            npc.setCollideWorldBounds(true);
            this.physics.add.collider(this.#player, npc, this.#collideObjects, null, this)
            this.physics.add.overlap(this.#playerInteractionZone, npc, () => {
                if(this.#controls.isActionJustDown) {
                    this.#player.interactedWithGameObject(npc);
                    this.#interact();
                }
            }, null, this);

        });
    }

    #registerCustomEvents() {
        return;
    }

    #interact() {
        // confirm the object can be interacted with
        if (this.#player.interactedObject.interactionComponent.canInteractWith()) {
            // check the interaction type
            switch (this.#player.interactedObject.interactionComponent.objectType) {
                case 'DIALOG':
                    const id = this.#player.interactedObject._stateMachine.userId;
                    const idDigit = id.charAt(id.length - 1);
                    this.#currentDialogNumber = 1;
                    this.#startDialog(idDigit, this.#currentDialogNumber);
                    break;
            }
        }
    }

    #startDialog(npcId, dialogDigit) {
        // disable the user's keys
        this.#controls.isFrozen = true;

        // set dialog
        const dialogSet = eval('NPC_DIALOG.DIALOG_' + npcId + '_' + dialogDigit + ';');
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_DIALOG, dialogSet);

        this.#currentDialogNumber++;
    }

    #continueDialog(dialogNumber) {
        // get dialog values
        const id = this.#player.interactedObject._stateMachine.userId;
        const idDigit = id.charAt(id.length - 1);

        // set dialog
        const dialogSet = eval('NPC_DIALOG.DIALOG_' + idDigit + '_' + dialogNumber + ';');

        // if that dialog doesn't exist
        if (dialogSet === undefined) {
            this.#currentDialogNumber = 0;
            this.#controls.isFrozen = false;
            EVENT_BUS.emit(CUSTOM_EVENTS.CLOSE_DIALOG);
            return;
        }

        // emmit dialog
        EVENT_BUS.emit(CUSTOM_EVENTS.SHOW_DIALOG, dialogSet);

        // increment dialog value
        this.#currentDialogNumber++;
    }
}