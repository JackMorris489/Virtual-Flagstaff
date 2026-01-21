"use client";

import React, { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser';

// Virtual Flagstaff Imports
import { gameConfig } from './src/main';
import { SCENE_KEYS } from './src/scenes/scene-keys';
import { PreloadScene } from './src/scenes/preload-scene';
import { GameScene } from './src/scenes/game-scene';
import { UiScene } from './src/scenes/ui-scene';
import { SkiGameScene } from './src/scenes/ski-game-scene';

export default function VirtualFlagstaff() {
    const gameRef = useRef(null)
    const [initialize, setInitialize] = useState(false)

    useEffect(() => {
        // Prevent SSR execution
        if (typeof window === 'undefined') return
        if (!initialize) return

        const game = new Phaser.Game(gameConfig)

        game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
        game.scene.add(SCENE_KEYS.GAME_SCENE, GameScene)
        game.scene.add(SCENE_KEYS.SKI_GAME, SkiGameScene)
        game.scene.add(SCENE_KEYS.UI_SCENE, UiScene)
        game.scene.start(SCENE_KEYS.PRELOAD_SCENE)

        gameRef.current = game

        return () => {
            game.destroy(true)
            gameRef.current = null
        }
    }, [initialize])

    return (
        <div>
            {!initialize && (
                <button onClick={() => setInitialize(true)}>
                    Start Game
                </button>
            )}
        </div>
    )
}