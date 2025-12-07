import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scenes/scene-keys';
import { PreloadScene } from './scenes/preload-scene';
import { GameScene } from './scenes/game-scene';
import { UiScene } from './scenes/ui-scene';
import { SkiGameScene } from './scenes/ski-game-scene';

const gameConfig  = {
    type: Phaser.CANVAS,
    pixelArt: true,
    roundPixels: true,
    scale: {
        parent: 'game-container',
        width: 384,
        height: 336,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        mode: Phaser.Scale.HEIGHT_CONTROLS_WIDTH,
    },
    backgroundColor: '#000000',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { x: 0, y: 0},
            debug: false,
        },
    },
};

const game = new Phaser.Game(gameConfig);

game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene);
game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene);
game.scene.add(SCENE_KEYS.SKI_GAME, SkiGameScene);
game.scene.add(SCENE_KEYS.UI_SCENE, UiScene);
game.scene.start(SCENE_KEYS.PRELOAD_SCENE);