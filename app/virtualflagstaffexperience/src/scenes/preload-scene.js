import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS } from '../common/assets';

export class PreloadScene extends Phaser.Scene {
    constructor() {
        super({
            key: SCENE_KEYS.PRELOAD_SCENE,
        });
    }

    preload() {
        // preload the assets
        this.load.pack(ASSET_PACK_KEYS.MAIN, 'assets/data/assets.json');
    }

    create() {
        this.#createAnimations();
        this.scene.start(SCENE_KEYS.GAME_SCENE);
    }

    #createAnimations(){
        // create animations from aseprite files
        this.anims.createFromAseprite(ASSET_KEYS.PLAYER);
        this.anims.createFromAseprite(ASSET_KEYS.SPIDER);
    }
}