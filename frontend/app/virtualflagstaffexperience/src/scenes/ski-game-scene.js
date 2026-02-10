import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import { SkiPlayer } from '../game-objects/player/ski-player';
import { ENABLE_LOGGING } from '../common/config';

/**
    The Ski Mini-game scene, this scene is opened by interacting with the respective objects.
    This scene stores the player, map, and obstacle data and handles collisions between the 
    player and obstacles and between the player and the finish line.
**/
export class SkiGame extends Phaser.Scene {
    #controls;
    player;
    #collisionLayer;
    #startLayer;
    #finishLayer;
    #obstacles
    uiScene;
    
    constructor() {
        super({
            key: SCENE_KEYS.SKI_GAME,
        });
    }

    create() {
        /* ========== MAP ========== */
        // add background image
        this.add.image(-224, 0, ASSET_KEYS.SKI_GAME_BACKGROUND, 0).setOrigin(0);

        // load in the tilemap data
        const map = this.make.tilemap({
            key: ASSET_KEYS.SKI_GAME_LEVEL,
        });

        // create collision layers
        const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);
        this.#collisionLayer = map.createLayer(TILED_LAYER_NAMES.SKI_COLLISION, [collisionTiles], -224, 0);
        this.#startLayer = map.createLayer(TILED_LAYER_NAMES.SKI_START, [collisionTiles], -224, 0);
        this.#finishLayer = map.createLayer(TILED_LAYER_NAMES.SKI_FINISH, [collisionTiles], -224, 0);

        /* ========== CONTROLS ========== */
        // check if keyboard is avalible then create controls
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        /* ========== PLAYER ========== */
        // get the playertype
        const playerModel = ASSET_KEYS[this.scene.get(SCENE_KEYS.GAME_SCENE).playerType];

        // create the player
        this.player = new SkiPlayer ({
            scene: this,
            position: {x: this.scale.width/2, y: this.scale.height/2},
            controls: this.#controls,
            assetKey: playerModel
        }).setDepth(6);

        // resize the camera viewport and follow the player
        this.cameras.main.startFollow(this.player).followOffset.set(0, -160-8);

        /* ========== Obstacles ========== */
        // create the obstacle group
        this.#obstacles = this.physics.add.group();

        // generate obstacles
        this.generateObsticles();

        /* ========== REGISTERS ========== */
        // register the events and colliders
        this.#registerColliders();

        // store the UI scene so it can be referenced
        this.uiScene = this.scene.get(SCENE_KEYS.UI_SCENE);
    };

    update() {
        this.#updateCamera();
    }

    // TODO: Improve logic to prevent overlap and prevent obstacles from generating too close together
    generateObsticles() {
        // break the map into 32 x 64 grid. In each 'square' attempt to spawn an obstacle 
        for (let row = 384; row < 3008; row += 64) {
            for (let column = 64; column < 480; column += 32) {
                // have a 1 in 10 chance of generating an obstacle
                let spawn = Phaser.Math.RND.between(0, 9);
                let type = Phaser.Math.RND.between(0, 4);
                let variance = Phaser.Math.RND.between(-16, 16);
                
                // deny spawn if it's not equal to 0
                if (spawn == 0) {
                    // spawn the corresponding type of object
                    switch (type) {
                        case 0:
                            this.#obstacles.create(column-variance, row-variance, ASSET_KEYS.SMALL_TREE).setDepth(5);
                            break;

                        case 1:
                            this.#obstacles.create(column-variance, row-variance, ASSET_KEYS.MEDIUM_TREE).setDepth(4);
                            break;

                        case 2:
                            this.#obstacles.create(column-variance, row-variance, ASSET_KEYS.LARGE_TREE).setDepth(2);
                            break;

                        case 3:
                            this.#obstacles.create(column-variance, row-variance, ASSET_KEYS.SMALL_ROCK).setDepth(3);
                            break;

                        case 4:
                            this.#obstacles.create(column-variance, row-variance, ASSET_KEYS.LARGE_ROCK).setDepth(1);
                            break;
                    }
                }
            }
        }
        // give the obstacles colliders
        this.#obstacles.getChildren().forEach((obstacle) => {
            this.physics.add.collider(this.player, obstacle, this.#collideWithObstacle, null, this);
        });
    }

    #collideWithObstacle() {
        // pause the current scene
        this.scene.pause();

        // pull up the UI scene for restarting or leaving the mini-game
        this.uiScene.showDialog("You Lost!\nPress C to play again. Or press Escape to Return to Flagstaff");
    }

    #collideWithFinish() {
        // pause the current scene
        this.scene.pause();

        // pull up UI scene for congradulations & restart or leave mini-game
        this.uiScene.showDialog("CONGRATS! YOU WIN!!\nPress C to play again. Or press Escape to Return to Flagstaff");
    }

    #registerColliders() {
        // set up colliders
        this.#collisionLayer.setCollision([this.#collisionLayer.tileset[0].firstgid]);
        this.#finishLayer.setCollision([this.#finishLayer.tileset[0].firstgid]);
        this.physics.add.collider(this.player, this.#collisionLayer);
        this.physics.add.collider(this.player, this.#finishLayer, this.#collideWithFinish, null, this);
    }

    #updateCamera() {
        // zoom out when going faster zoom in when going slower
        // function for zoom: max zoom/((zoom factor * velocity) + 1)
        this.cameras.main.zoom = 1.1/((0.002 * this.player.body.velocity.y) + 1)
    }
}