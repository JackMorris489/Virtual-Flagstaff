import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scenes/scene-keys';
import { PreloadScene } from './scenes/preload-scene';
import { GameScene } from './scenes/game-scene';
import { UiScene } from './scenes/ui-scene';
import { SkiGameScene } from './scenes/ski-game-scene';

export const gameConfig  = {
    type: Phaser.CANVAS,
    pixelArt: true,
    roundPixels: true,
    scale: {
        parent: 'game-container',
        width: 512,
        height: 464,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
    },
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0},
            debug: true,
        },
    },
};