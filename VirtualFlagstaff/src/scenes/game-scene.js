import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';

export class GameScene extends Phaser.Scene {
    #player;
    #controls;

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
            assetKey: ASSET_KEYS.PLAYER,
            frame: 0,
            controls: this.#controls,
        });
    }
}