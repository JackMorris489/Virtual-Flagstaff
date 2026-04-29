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

/**
    

**/
export class WildlifeGame extends GameScene {
    #controls;
    player;
    uiScene;
    photos = CAMERA_PHOTOS;
    score;
    scoreText;
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

        /* ========== MAP ========== */
        this.add.image(0, 0, ASSET_KEYS.WILDLIFE_GAME_BACKGROUND, 0).setOrigin(0);

        /* ========== CONTROLS ========== */
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        /* ========== PLAYER ========== */
        this.player = new WildlifePlayer({
            scene: this,
            position: { x: this.scale.width / 2, y: this.scale.height / 2 },
            controls: this.#controls,
        }).setDepth(6);
        this.player.setScale(2,2);

        // resize the camera viewport and follow the player
        this.cameras.main.startFollow(this.player);
        this.cameras.main.setZoom(0.5);
        this.cameras.main.setBounds(0, 0, 2560, 2320);

        /* ========== SCORE ========== */
        this.scoreText = this.add
            .text(20-512, 20-464, 'Score: 0', {
                fontSize: '48px',
                color: '#ffd700',
                stroke: '#000000',
                strokeThickness: 8,
            })
            .setScrollFactor(0)
            .setDepth(100)
            .setVisible(false);

        /* ========== REGISTERS ========== */
        this.uiScene = this.scene.get(SCENE_KEYS.UI_SCENE);

        /* ========== START SCREEN ========== */
        this.uiScene.showDialog(await this.buildStartDialogText());
    }


    update() {
        /*
            if(this.controls.isActionJustDown) {
                this.player.interactedWithGameObject(npc);
                this.player.interact();
            }
        */

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
            'Take as many photos as you can within the alloted time\n\n' +
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