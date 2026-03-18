import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import { SkiPlayer } from '../game-objects/player/ski-player';
import { ENABLE_LOGGING } from '../common/config';
import apiFetch from "../../../utils/apiFetch"
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { GameScene } from './game-scene';

/**
    The Ski Mini-game scene, this scene is opened by interacting with the respective objects.
    This scene stores the player, map, and obstacle data and handles collisions between the
    player and obstacles and between the player and the finish line.
**/
export class SkiGame extends GameScene {
    #controls;
    player;
    #collisionLayer;
    #startLayer;
    #finishLayer;
    endlessMode = false;
    #obstacles;
    uiScene;

    coins;
    scoreText;
    isStartScreen = true;
    hasEnded = false;

    constructor() {
        super({
            sceneKey: SCENE_KEYS.SKI_GAME,
            gameKey: "SKI_GAME"
        });
    }

    async create() {
        this.scene.pause();
        this.isStartScreen = true;
        this.hasEnded = false;
        this.resetScore();

        /* ========== MAP ========== */
        this.add.image(-224, 0, ASSET_KEYS.SKI_GAME_BACKGROUND, 0).setOrigin(0);

        const map = this.make.tilemap({
            key: ASSET_KEYS.SKI_GAME_LEVEL,
        });

        // create collision layers
        const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.SKI_GAME_BARRIER);
        this.#collisionLayer = map.createLayer(TILED_LAYER_NAMES.SKI_COLLISION, [collisionTiles], -224, 0);
        this.#startLayer = map.createLayer(TILED_LAYER_NAMES.SKI_START, [collisionTiles], -224, 0);
        this.#finishLayer = map.createLayer(TILED_LAYER_NAMES.SKI_FINISH, [collisionTiles], -224, 0);

        /* ========== CONTROLS ========== */
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        /* ========== PLAYER ========== */
        const playerModel = ASSET_KEYS[this.scene.get(SCENE_KEYS.GAME_SCENE).playerType];

        this.player = new SkiPlayer({
            scene: this,
            position: { x: this.scale.width / 2, y: this.scale.height / 2 },
            controls: this.#controls,
            assetKey: playerModel,
        }).setDepth(6);

        // resize the camera viewport and follow the player
        this.cameras.main.startFollow(this.player).followOffset.set(0, -160);

        /* ========== OBSTACLES ========== */
        this.#obstacles = this.physics.add.group();

        // generate obstacles
        this.generateObsticles(384);

        /* ========== COINS ========== */
        this.coins = this.physics.add.group();
        this.generateCoins(460);

        this.scoreText = this.add
            .text(20, 20, 'Score: 0', {
                fontSize: '24px',
                color: '#ffd700',
                stroke: '#000000',
                strokeThickness: 4,
            })
            .setScrollFactor(0)
            .setDepth(100)
            .setVisible(false);

        /* ========== REGISTERS ========== */
        this.#registerColliders();
        this.uiScene = this.scene.get(SCENE_KEYS.UI_SCENE);
        
        this.endlessMode = await this.playerHasEndlessMode();
        // this.endlessMode = this.scene.get(SCENE_KEYS.GAME_SCENE).skiEndlessMode;

      /* ========== START SCREEN ========== */
        this.uiScene.showDialog(await this.buildStartDialogText());
    }


    async playerHasEndlessMode()
    {
        try
        {
            let playerModel = ASSET_KEYS[this.scene.get(SCENE_KEYS.GAME_SCENE).playerType];
            const playerRewards = await this.getPlayerRewards();
            console.log(playerRewards)

            

            const hasEndlessMode = playerRewards.some(
                reward => reward.key === "ENDLESS_SKI_GAME"
            );

            // TODO: Refactor this section of conditionals
            if (playerModel === "SKIIER")
            {
                questId = 2;
            }

            else if (playerModel === "SNOWBOARDER")
            {
                questId = 1;
            }
            ///////////////////////////////////////////////

            const playerQuest = await apiFetch(`/users/me/quest/{questId}`, {credentials: "include"});

            return hasEndlessMode && playerQuest.is_complete;
        }
        catch
        {
            return this.endlessMode;
        }
    }


    async getPlayerRewards()
    {
        return await apiFetch("/users/me/rewards", {credentials: "include"})
    }


    update() {
        this.#updateCamera();

        if(this.endlessMode) {
            if (this.player.physicsBody.y >= 2000) {
                // remove all the current objects within 200 pixels behind the player
                this.#obstacles.getChildren().forEach((obstacle) => {
                    if (obstacle.body.y - this.player.physicsBody.y <= -200 || obstacle.body.y - this.player.physicsBody.y >= 1152) {
                        obstacle.destroy();
                    }
                });
                this.coins.getChildren().forEach((coin) => {
                    if (coin.body.y - this.player.physicsBody.y <= -200 || coin.body.y - this.player.physicsBody.y >= 1152) {
                        coin.destroy();
                    }
                })

                // teleport all of the objects within 1000 y pixels 
                this.#obstacles.getChildren().forEach((obstacle) => {
                    if (obstacle.body.y - this.player.physicsBody.y < 1152) {
                        obstacle.body.y -= 1600;
                    }
                });
                this.coins.getChildren().forEach((coin) => {
                    if (coin.body.y - this.player.physicsBody.y < 1152) {
                        coin.body.y -= 1600;
                    }
                })

                // teleport the player
                this.player.physicsBody.y -= 1600;

                // create new obstacles
                this.generateObsticles(1280);

                // generate new coins
                this.generateCoins(1280);
            }
        }
    }

    // TODO: Improve logic to prevent overlap and prevent obstacles from generating too close together
    generateObsticles(rowStart) {
        // break the map into 32 x 64 grid. In each 'square' attempt to spawn an obstacle 
        for (let row = rowStart; row < 3008; row += 64) {
            for (let column = 64; column < 480; column += 32) {
                const spawn = Phaser.Math.RND.between(0, 9);
                const type = Phaser.Math.RND.between(0, 4);
                const variance = Phaser.Math.RND.between(-16, 16);

                if (spawn === 0) {
                    switch (type) {
                        case 0:
                            this.#obstacles.create(column - variance, row - variance, ASSET_KEYS.SMALL_TREE).setDepth(5);
                            break;
                        case 1:
                            this.#obstacles.create(column - variance, row - variance, ASSET_KEYS.MEDIUM_TREE).setDepth(4);
                            break;
                        case 2:
                            this.#obstacles.create(column - variance, row - variance, ASSET_KEYS.LARGE_TREE).setDepth(2);
                            break;
                        case 3:
                            this.#obstacles.create(column - variance, row - variance, ASSET_KEYS.SMALL_ROCK).setDepth(3);
                            break;
                        case 4:
                            this.#obstacles.create(column - variance, row - variance, ASSET_KEYS.LARGE_ROCK).setDepth(1);
                            break;
                    }
                }
            }
        }
        // give the obstacles colliders and remove some(?) duplicates
        this.#obstacles.getChildren().forEach((obstacle) => {
            let closest = this.physics.closest(obstacle, this.#obstacles.getChildren());
            while (this.physics.world.overlap(obstacle, closest)) {
                closest.destroy();
                closest = this.physics.closest(obstacle, this.#obstacles.getChildren());
            }
            this.physics.add.collider(this.player, obstacle, this.#collideWithObstacle, null, this);
        });
    }

    generateCoins(rowStart) {
        // Spread coins in reachable lanes so they feel intentional instead of clumped.
        const lanes = [112, 176, 240, 304, 368, 432];
        let lastLaneIndex = -1;

        for (let row = rowStart; row < 2860; row += 165) {
            let laneIndex = Phaser.Math.Between(0, lanes.length - 1);

            // Avoid repeating the same lane too often
            if (laneIndex === lastLaneIndex) {
                laneIndex = (laneIndex + Phaser.Math.Between(1, lanes.length - 1)) % lanes.length;
            }
            lastLaneIndex = laneIndex;

            const x = lanes[laneIndex] + Phaser.Math.Between(-8, 8);
            const y = row + Phaser.Math.Between(-12, 12);

            const coin = this.coins.create(x, y, ASSET_KEYS.COIN);
            coin.setDepth(5);
            coin.setScale(0.28);

            if (coin.body) {
                const w = Math.max(10, Math.floor(coin.width * 0.45));
                const h = Math.max(10, Math.floor(coin.height * 0.45));
                coin.body.setSize(w, h, true);
            }
        }

        this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    }

    collectCoin(player, coin) {
        if (this.hasEnded || !coin.active) return;

        coin.destroy();
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
    }

    onEnterPressed() {
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
            'SKI MINI GAME\n\n' +
            'Collect coins for points\n' +
            'Avoid obstacles\n\n' +
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

    async #collideWithObstacle() {
        if (this.hasEnded) return;

        this.hasEnded = true;
        this.scene.pause();

        await this.submitGameSession()

        this.uiScene.showDialog(await this.buildEndDialogText('You Lost!'));
    }

    async #collideWithFinish() {
        if (this.hasEnded) return;

        this.hasEnded = true;
        this.submitGameSession()
        this.scene.pause();

        // this.scene.get(SCENE_KEYS.GAME_SCENE).skiEndlessMode = true;

        // pull up UI scene for congradulations & restart or leave mini-game
        this.uiScene.showDialog("CONGRATS! YOU WIN!!\nPress C to play again. Or press Escape to Return to Flagstaff");
        let questId;
        const playerModel = ASSET_KEYS[this.scene.get(SCENE_KEYS.GAME_SCENE).playerType];


        // TODO: Refactor this section of conditionals
        if (playerModel === "SKIIER")
        {
            questId = 2;
        }

        else if (playerModel === "SNOWBOARDER")
        {
            questId = 1;
        }
        ///////////////////////////////////////////////

        try
        {
            const data = await apiFetch(`/users/me/quests/${questId}`, {
                method: "PATCH",
                credentials: "include",
            });

            EVENT_BUS.emit(CUSTOM_EVENTS.REFRESH_QUESTS)
        }

        catch (e) {
            
        }

        finally
        {
            this.endlessMode = true;
        }

        let rewards;
        try
        {
            rewards = await apiFetch(`/quests/${questId}/rewards`);
        }

        catch (err)
        {
            console.error(err)
        }

        this.uiScene.showDialog(await this.buildEndDialogText(`CONGRATS! YOU WIN!!\nYou win the ${rewards[0].name}`));
    }

    #registerColliders() {
        this.#collisionLayer.setCollision([this.#collisionLayer.tileset[0].firstgid]);
        this.#finishLayer.setCollision([this.#finishLayer.tileset[0].firstgid]);

        this.physics.add.collider(this.player, this.#collisionLayer);
        this.physics.add.collider(this.player, this.#finishLayer, this.#collideWithFinish, null, this);
    }

    #updateCamera() {
        // zoom out when going faster zoom in when going slower
        // function for zoom: max zoom/((zoom factor * velocity) + 1)
        const cameraZoom = Phaser.Math.Clamp((1.1/((0.002 * this.player.body.velocity.y) + 1)), 0.65, 1.1)
        this.cameras.main.zoom = cameraZoom
    }
}