import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/npcs/spider';
import { CharacterGameObject } from '../game-objects/common/character-game-object';

export class GameScene extends Phaser.Scene {
    #controls;
    #player;
    #npcGroup;
    #spider;
    #spider2;

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
        });
//        this.#player.setImmovable(true);

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

        this.#registerColiders();
    };

    #collideObjects() {
        this.#player.setVelocityX(0);
        this.#player.setVelocityY(0);
    }

    #registerColiders() {
        this.#npcGroup.getChildren().forEach((npc) => {
            npc.setCollideWorldBounds(true);
            this.physics.add.collider(this.#player, npc, this.#collideObjects, null, this)
        });

        /*
        this.physics.add.overlap(this.#player, this.#npcGroup, (player, npc) => {
            console.log('hit');
        });
        */
    }
}