import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import { SkiPlayer } from '../game-objects/player/ski-player';

export class SkiGameScene extends Phaser.Scene {
    #controls;
    player;
    #playerType;
    #collisionLayer;
    #startLayer;
    #finishLayer;
    #obsticles
    uiScene;
    worldscene;
    
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
        this.add.image(-224, 0, ASSET_KEYS.SKI_GAME_BACKGROUND, 0).setOrigin(0);

        // load in the tilemap data
        const map = this.make.tilemap({
            key: ASSET_KEYS.SKI_GAME_LEVEL,
        });
        
        const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);
        
        // create collision layers
        this.#collisionLayer = map.createLayer(TILED_LAYER_NAMES.SKI_COLLISION, [collisionTiles], -224, 0);
        this.#startLayer = map.createLayer(TILED_LAYER_NAMES.SKI_START, [collisionTiles], -224, 0);
        this.#finishLayer = map.createLayer(TILED_LAYER_NAMES.SKI_FINISH, [collisionTiles], -224, 0);

        this.worldscene = this.scene.get(SCENE_KEYS.GAME_SCENE);
        console.log(this.worldscene.playerType);

        var test = eval('ASSET_KEYS.' + this.worldscene.playerType + ';');
        console.log(test);

        // create player
        this.player = new SkiPlayer ({
            scene: this,
            position: {x: this.scale.width/2, y: this.scale.height/2},
            controls: this.#controls,
            assetKey: test
        })

        // have the camera follow the player
        this.cameras.main.startFollow(this.player).followOffset.set(0, -160+32+32);

        this.#obsticles = this.physics.add.group();

        // generate obsticles
        this.generateObsticles();

        this.uiScene = this.scene.get(SCENE_KEYS.UI_SCENE);

        // set up colliders
        this.#collisionLayer.setCollision([this.#collisionLayer.tileset[0].firstgid]);
        this.#finishLayer.setCollision([this.#finishLayer.tileset[0].firstgid]);
        this.physics.add.collider(this.player, this.#collisionLayer);
        this.physics.add.collider(this.player, this.#finishLayer, this.#collideWithFinish, null, this);
    };

    generateObsticles() {
        // have a 1 in 5 chance of generating an obsticle
        for (var row = 384; row < 3008; row += 64) {
            for (var column = 64; column < 480; column += 32) {
                let spawn = Phaser.Math.RND.between(0, 7);
                let type = Phaser.Math.RND.between(0, 4);
                let variance = Phaser.Math.RND.between(-16, 16);
                
                // deny spawn if it's not equal to 0
                if (spawn == 0) {
                    // spawn the corresponding type of object
                    switch (type) {
                        case 0:
                            this.#obsticles.create(column-variance, row-variance, ASSET_KEYS.SMALL_TREE).setDepth(5);
                            break;

                        case 1:
                            this.#obsticles.create(column-variance, row-variance, ASSET_KEYS.MEDIUM_TREE).setDepth(4);
                            break;

                        case 2:
                            this.#obsticles.create(column-variance, row-variance, ASSET_KEYS.LARGE_TREE).setDepth(2);
                            break;

                        case 3:
                            this.#obsticles.create(column-variance, row-variance, ASSET_KEYS.SMALL_ROCK).setDepth(3);
                            break;

                        case 4:
                            this.#obsticles.create(column-variance, row-variance, ASSET_KEYS.LARGE_ROCK).setDepth(1);
                            break;
                    }
                }
            }
        }
        // give the obsticles colliders
        this.#obsticles.getChildren().forEach((obsticle) => {
            this.physics.add.collider(this.player, obsticle, this.#collideWithObsticle, null, this);
        });
    }

    #collideWithObsticle() {
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
}