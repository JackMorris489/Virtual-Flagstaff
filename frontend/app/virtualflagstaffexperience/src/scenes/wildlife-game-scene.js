import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import { SkiPlayer } from '../game-objects/player/ski-player';
import { CAMERA_PHOTOS, ENABLE_LOGGING } from '../common/config';
import apiFetch from "../../../utils/apiFetch"
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { GameScene } from './game-scene';
import { Player } from '../game-objects/player/player';
import { WildlifePlayer } from '../game-objects/player/wildlife-player';
import { WildLifeAnimal } from '../game-objects/npcs/wildlife-animal';

/**
    

**/
export class WildlifeGame extends GameScene {
    #controls;
    player;
    uiScene;
    photos = CAMERA_PHOTOS;
    timer;
    repeatCount = 0;
    #animals;
    score;
    scoreText;
    log15;
    isStartScreen = true;
    hasEnded = false;

    constructor() {
        super({
            sceneKey: SCENE_KEYS.WILDLIFE_GAME,
            gameKey: "WILDLIFE_GAME"
        });
    }

    async create() {
        this.scene.pause();
        this.isStartScreen = true;
        this.hasEnded = false;
        this.resetScore();
        this.photos = CAMERA_PHOTOS;

        /* ========== MAP ========== */
        this.add.image(0, 0, ASSET_KEYS.WILDLIFE_GAME_BACKGROUND, 0).setDepth(0).setOrigin(0);

        /* ========== CONTROLS ========== */
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        /* ========== PLAYER ========== */
        this.player = new WildlifePlayer({
            scene: this,
            position: { x: 2560-512-512, y: 2320-464},
            controls: this.#controls,
        }).setDepth(6);
        this.player.setScale(2,2);

        // resize the camera viewport and follow the player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(0.334);
        this.cameras.main.setBounds(0, 0, 2560, 2320);

        /* ========== ANIMALS ========== */
        this.#animals = this.physics.add.group({classType: WildLifeAnimal, maxSize: 30});


        /* ========== SCORE ========== */
        this.scoreText = this.add
            .text(10-512, 80-464, 'Score: 0', {
                fontSize: '48px',
                color: '#ffd700',
                stroke: '#000000',
                strokeThickness: 8,
            })
            .setScrollFactor(0)
            .setDepth(100)
            .setVisible(false);

        /* ========== TIMER ========== */
        this.timer = this.time.addEvent({
            delay: 3500, // ms
            callback: this.runTimmerEvent,
            callbackScope: this,
            loop: true,
        });
        this.log15 = 1/Math.log(15)

        /* ========== REGISTERS ========== */
        this.uiScene = this.scene.get(SCENE_KEYS.UI_SCENE);

        /* ========== START SCREEN ========== */
        this.uiScene.showDialog(await this.buildStartDialogText());
    }


    update() {
        if(this.#controls.isActionJustDown) {
            this.takePhoto();
        }
    }

    runTimmerEvent() {
        this.repeatCount ++;
        this.timer.timeScale = Phaser.Math.Clamp((Math.log(this.repeatCount*2+2) * this.log15), 0.5, 2);
//        this.despawnAnimals();
        this.spawnAnimals();
    }

    spawnAnimals() {
        // prepare to spawn
        console.log("SPAWNING!");
        let postionX;
        let postionY;

        // choose a number 0-3 of animals to spawn
        for (let spawnNumber = Phaser.Math.RND.between(1, 3); spawnNumber > 0; spawnNumber--) {
            console.log("SPAWN NUMBER: ", spawnNumber);
            // for each animal being spawned, randomly choose a type
            let spawnType = Phaser.Math.RND.between(0, 2);
            console.log("SPAWN TYPE: ", spawnType);
            switch (spawnType) {
                // rodent
                case 0:
                    // set the postion randomly
                    postionX = Phaser.Math.RND.between(32, 2560-32);
                    postionY = Phaser.Math.RND.between(2320/2, 2320-32-128-128);
                    this.#animals.add(new WildLifeAnimal({
                        scene: this,
                        position: { x: postionX, y: postionY },
                        assetKey: ASSET_KEYS.WILDLIFE_RODENT,
                    })).setDepth(4);
                    break;
                // deer
                case 1:
                    postionX = Phaser.Math.RND.between(64, 2560-64);
                    postionY = Phaser.Math.RND.between(2320/2, 2320-64-128-128);
                    this.#animals.add(new WildLifeAnimal({
                        scene: this,
                        position: { x: postionX, y: postionY },
                        assetKey: ASSET_KEYS.WILDLIFE_DEER,
                    })).setDepth(4);
                    break;
                // bird
                case 2:
                    postionX = Phaser.Math.RND.between(32, 2560-32);
                    postionY = Phaser.Math.RND.between(32, 2320/2);
                    this.#animals.add(new WildLifeAnimal({
                        scene: this,
                        position: { x: postionX, y: postionY },
                        assetKey: ASSET_KEYS.WILDLIFE_BIRD,
                    })).setDepth(4);
                    break;
            }
        }
    }

    despawnAnimals() {
        // prepare to despawn
        console.log("DESPAWNING");
    }

    takePhoto() {
        // decrement the photos value
        this.photos --;

        this.#animals.getChildren().forEach((animal) => {
            if (this.physics.overlap(this.player, animal)) {
                console.log("Player took a photo of an animal!");

                // add score
                this.calculateScore(animal);
                this.scoreText.setText(`Score: ${this.score}`);

                // delete animal
                this.#animals.remove(animal, true);
            }
        });
        
        // check if the game ends
        if (this.photos <= 0) {
            this.endGame();
        }
    }

    calculateScore(object) {
        // calcuate the distance between the center of the player and the object
        let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, object.x, object.y);

        // multiply using the distance to score formula
        let addedScore = distance * 0.1;
        addedScore = Phaser.Math.RoundTo(addedScore, 0);
        console.log(addedScore);

        // add the value to score
        this.score += addedScore;
    }

    async endGame() {
        // double check if photos have run out
        if (this.photos > 0) {
            console.warn("END GAME FALSELY CALLED");
            return;
        }

        if (this.hasEnded) return;

        this.hasEnded = true;
        this.scene.pause();

        await this.submitGameSession()

        this.uiScene.showDialog(await this.buildEndDialogText('Game Over!'));
    }


    onEnterPressed() {
        console.log('Enter Testing');
        if (this.isStartScreen) {
            this.isStartScreen = false;
            this.hasEnded = false;
            this.scoreText.setVisible(true);
            this.scene.resume();
            return;
        }

        this.scene.restart();
    }

    async buildStartDialogText() {
        return (
            'WILDLIFE IDENTIFICATION\n\n' +
            'Take photos of animals to earn points\n' +
            'Your camera has ten photos left in its reel! Make them count!\n' +
            'Press \'X\' to take a photo!\n\n',
            'Press Enter to start\n' +
            'Press Escape to return to Flagstaff\n\n' +
            await this.getLeaderboardText()
        );
    }

    async getLeaderboard() {
        return await apiFetch(`/game-sessions/${this.gameKey}/leaderboard`)
    }

    async getLeaderboardText() {
        const leaderboard = await this.getLeaderboard();

        if (leaderboard.length === 0) {
            return 'Leaderboard:\nNo scores yet';
        }

        let text = 'Leaderboard:\n';
        leaderboard.forEach((entry, index) => {
            text += `${index + 1}. ${entry.username}: ${entry.score}\n`;
        });
        return text.trimEnd();
    }

    async buildEndDialogText(titleText) {
        return (
            `${titleText}\n` +
            `Score: ${this.score}\n\n` +
            'Press Enter to play again\n' +
            'Press Escape to return to Flagstaff\n\n' +
            await this.getLeaderboardText()
        );
    }
}