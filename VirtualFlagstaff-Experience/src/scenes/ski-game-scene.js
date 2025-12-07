import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import { SkiPlayer } from '../game-objects/player/ski-player';

export class SkiGameScene extends Phaser.Scene {
    #controls;
    #player;
    #collisionLayer;
    #startLayer;
    #finishLayer;
    
    constructor() {
        super({
            key: SCENE_KEYS.SKI_GAME,
        });
    }

    create() {
        // resize the game
        this.game.scale.resize(512, 464);
        this.cameras.main.setViewport(0, 0, 512, 464);

        // check if keyboard is avalible
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        // add background
        this.add.image(-226, 0, ASSET_KEYS.SKI_GAME_BACKGROUND, 0).setOrigin(0);

        // load in the tilemap data
        const map = this.make.tilemap({
            key: ASSET_KEYS.SKI_GAME_LEVEL,
        });
        
        const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);
        
        // create collision layers
        this.#collisionLayer = map.createLayer(TILED_LAYER_NAMES.SKI_COLLISION, [collisionTiles], -226, 0);
        this.#startLayer = map.createLayer(TILED_LAYER_NAMES.SKI_START, [collisionTiles], -226, 0);
        this.#finishLayer = map.createLayer(TILED_LAYER_NAMES.SKI_FINISH, [collisionTiles], -226, 0);
//        this.#collisionLayer.setDepth(2).setAlpha(0);

        // create player
        this.#player = new SkiPlayer({
            scene: this,
            position: {x: this.scale.width/2, y: this.scale.height/2},
            controls: this.#controls,
        })

        /*
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
        */

        // create the camera:
        this.cameras.main.startFollow(this.#player).followOffset.set(0, -160+32+32);

        // set up colliders
        this.#collisionLayer.setCollision([this.#collisionLayer.tileset[0].firstgid]);
        this.physics.add.collider(this.#player, this.#collisionLayer);
    };

    update() {
        
    }
}