"use client";

import React, { useEffect, useRef } from 'react'
import apiFetch from '../utils/apiFetch';

export default function VirtualFlagstaff() {
    const gameRef = useRef(null)

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (gameRef.current) return // prevent double init (StrictMode)

        let game;
        let isDisposed = false;

        const startGame = async () => {
            const [
                Phaser,
                { gameConfig },
                { SCENE_KEYS },
                { PreloadScene },
                { Overworld },
                { UiScene },
                { SkiGame },
                { DinerGame },
                { TutorialScene },
                { PauseMenu },
            ] = await Promise.all([
                import('phaser'),
                import('./src/main'),
                import('./src/scenes/scene-keys'),
                import('./src/scenes/preload-scene'),
                import('./src/scenes/overworld-scene'),
                import('./src/scenes/ui-scene'),
                import('./src/scenes/ski-game-scene'),
                import('./src/scenes/diner-game-scene'),
                import('./src/scenes/tutorial-scene'),
                import('./src/scenes/pause-menu'),
            ]);

            if (isDisposed) return;

            try {
                const player = await apiFetch("/users/me", {credentials: "include"})
                localStorage.setItem("playerLoggedIn", "true")
                localStorage.setItem(
                    "playerCompletedTutorial",
                    player.completed_tutorial.toString()
                )
            } 

            catch 
            {
                localStorage.setItem("playerLoggedIn", "false")
                localStorage.setItem("playerCompletedTutorial", "false")
            }

            if (isDisposed) return;

            game = new Phaser.Game(gameConfig)

            game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
            game.scene.add(SCENE_KEYS.GAME_SCENE, Overworld)
            game.scene.add(SCENE_KEYS.SKI_GAME, SkiGame)
            game.scene.add(SCENE_KEYS.DINER_GAME, DinerGame)
            game.scene.add(SCENE_KEYS.UI_SCENE, UiScene)
            game.scene.add(SCENE_KEYS.TUTORIAL_SCENE, TutorialScene)
            game.scene.add(SCENE_KEYS.PAUSE_MENU, PauseMenu)

            game.scene.start(SCENE_KEYS.PRELOAD_SCENE)

            gameRef.current = game
        }

        startGame();

        return () => {
            isDisposed = true;
            if (game) {
                game.destroy(true)
                gameRef.current = null
            }
        }
    }, [])

    return (
        <div id="game-container"/>
    )
}
