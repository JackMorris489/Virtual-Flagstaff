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
    #obstacles;
    uiScene;

    score = 0;
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

    create() {
        this.score = 0;
        this.isStartScreen = true;
        this.hasEnded = false;

        /* ========== MAP ========== */
        this.add.image(-224, 0, ASSET_KEYS.SKI_GAME_BACKGROUND, 0).setOrigin(0);

        const map = this.make.tilemap({
            key: ASSET_KEYS.SKI_GAME_LEVEL,
        });

        const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);
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

        this.cameras.main.startFollow(this.player).followOffset.set(0, -168);

        /* ========== OBSTACLES ========== */
        this.#obstacles = this.physics.add.group();
        this.generateObsticles();

        /* ========== COINS ========== */
        this.coins = this.physics.add.group();
        this.generateCoins();

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

        /* ========== START SCREEN ========== */
        this.scene.pause();
        this.uiScene.showDialog(this.buildStartDialogText());
    }

    update() {
        this.#updateCamera();
    }

    generateObsticles() {
        for (let row = 384; row < 3008; row += 64) {
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

        this.#obstacles.getChildren().forEach((obstacle) => {
            this.physics.add.collider(this.player, obstacle, this.#collideWithObstacle, null, this);
        });
    }

    generateCoins() {
        // Spread coins in reachable lanes so they feel intentional instead of clumped.
        const lanes = [112, 176, 240, 304, 368, 432];
        let lastLaneIndex = -1;

        for (let row = 460; row < 2860; row += 165) {
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

        coin.disableBody(true, true);
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

    buildStartDialogText() {
        return (
            'SKI MINI GAME\n\n' +
            'Collect coins for points\n' +
            'Avoid obstacles\n\n' +
            'Press Enter to start\n' +
            'Press Escape to return to Flagstaff\n\n' +
            this.getLeaderboardText()
        );
    }

    getLeaderboard() {
        try {
            const raw = window.localStorage.getItem('virtual_flagstaff_ski_leaderboard');
            const parsed = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(parsed)) return [];
            return parsed
                .filter((value) => Number.isFinite(value))
                .sort((a, b) => b - a)
                .slice(0, 5);
        } catch (error) {
            console.error('Failed to read ski leaderboard:', error);
            return [];
        }
    }

    saveScoreToLeaderboard(score) {
        try {
            const leaderboard = this.getLeaderboard();
            leaderboard.push(score);

            const trimmed = leaderboard
                .filter((value) => Number.isFinite(value))
                .sort((a, b) => b - a)
                .slice(0, 5);

            window.localStorage.setItem(
                'virtual_flagstaff_ski_leaderboard',
                JSON.stringify(trimmed)
            );
        } catch (error) {
            console.error('Failed to save ski leaderboard:', error);
        }
    }

    getLeaderboardText() {
        const leaderboard = this.getLeaderboard();

        if (leaderboard.length === 0) {
            return 'Leaderboard:\nNo scores yet';
        }

        let text = 'Leaderboard:\n';
        leaderboard.forEach((score, index) => {
            text += `${index + 1}. ${score}\n`;
        });
        return text.trimEnd();
    }

    buildEndDialogText(titleText) {
        return (
            `${titleText}\n` +
            `Score: ${this.score}\n\n` +
            'Press Enter to play again\n' +
            'Press Escape to return to Flagstaff\n\n' +
            this.getLeaderboardText()
        );
    }

    #collideWithObstacle() {
        if (this.hasEnded) return;

        this.hasEnded = true;
        this.saveScoreToLeaderboard(this.score);
        this.scene.pause();

        this.uiScene.showDialog(this.buildEndDialogText('You Lost!'));
    }

    async #collideWithFinish() {
        if (this.hasEnded) return;

        this.hasEnded = true;
        this.saveScoreToLeaderboard(this.score);
        this.scene.pause();

        let questId;
        const playerModel = ASSET_KEYS[this.scene.get(SCENE_KEYS.GAME_SCENE).playerType];
        if (playerModel === "SKIIER")
        {
            questId = 2;
        }

        else if (playerModel === "SNOWBOARDER")
        {
            questId = 1;
        }

        try
        {
            const data = await apiFetch(`/users/me/quests/${questId}`, {
                method: "PATCH",
                credentials: "include",
                headers: {"Content-Type": "application/json"},
            });

            console.log(data)
            EVENT_BUS.emit(CUSTOM_EVENTS.REFRESH_QUESTS)
        }

        catch (e) {
            throw e
        }

        this.uiScene.showDialog(this.buildEndDialogText('CONGRATS! YOU WIN!!'));
    }

    #registerColliders() {
        this.#collisionLayer.setCollision([this.#collisionLayer.tileset[0].firstgid]);
        this.#finishLayer.setCollision([this.#finishLayer.tileset[0].firstgid]);

        this.physics.add.collider(this.player, this.#collisionLayer);
        this.physics.add.collider(this.player, this.#finishLayer, this.#collideWithFinish, null, this);
    }

    #updateCamera() {
        this.cameras.main.zoom = 1.1 / ((0.002 * this.player.body.velocity.y) + 1);
    }
}