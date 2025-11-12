import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, AUDIO } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';

export class GameScene extends Phaser.Scene {
    #player;
    #walls;
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

        this.#setupMusic();

        this.#setupCamera();

        // create the walls
        this.#walls = this.physics.add.staticGroup()

        for (let i = 0; i < 10; i++)
        {
            this.#walls.create(32+(i*64), 32, ASSET_KEYS.SQUARE)
            this.#walls.create(32+(i*64), -32+(64*10), ASSET_KEYS.SQUARE);
        }
        for (let i = 0; i < 10; i++)
        {
            this.#walls.create(32, 32+(i*64), ASSET_KEYS.SQUARE);
            this.#walls.create(-32+(64*10), 32+(i*64), ASSET_KEYS.SQUARE);
        }
        for (let i = 0; i < 3; i++)
        {
            this.#walls.create(96+64+64, 32+64+(i*64), ASSET_KEYS.SQUARE);
        }

        this.physics.add.collider(this.#player, this.#walls);
    }

    #setupMusic() {
    // create music
        const music = this.sound.add(AUDIO.LIFE_IS_A_HIGHWAY, {volume: 0.05});
        music.play();
        this.sound.pauseOnBlur = true;
        music.loop = true;
    }
    
    #setupCamera() {
        this.cameras.main.startFollow(this.#player);
    }
}