"use client";

import React, { useEffect, useRef, useState } from 'react'
import * as Phaser from 'phaser';

// Virtual Flagstaff Imports
import { gameConfig } from './src/main';
import { SCENE_KEYS } from './src/scenes/scene-keys';
import { PreloadScene } from './src/scenes/preload-scene';
import { Overworld } from './src/scenes/overworld-scene';
import { UiScene } from './src/scenes/ui-scene';
import { SkiGame } from './src/scenes/ski-game-scene';
import apiFetch from '../utils/apiFetch';
import { TutorialScene } from './src/scenes/tutorial-scene';
import { PauseMenu } from './src/scenes/pause-menu';

export default function VirtualFlagstaff() {
    const gameRef = useRef(null)

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (gameRef.current) return // prevent double init (StrictMode)

        let game;

        const startGame = async () => {
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

            game = new Phaser.Game(gameConfig)

            game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
            game.scene.add(SCENE_KEYS.GAME_SCENE, Overworld)
            game.scene.add(SCENE_KEYS.SKI_GAME, SkiGame)
            game.scene.add(SCENE_KEYS.UI_SCENE, UiScene)
            game.scene.add(SCENE_KEYS.TUTORIAL_SCENE, TutorialScene)
            game.scene.add(SCENE_KEYS.PAUSE_MENU, PauseMenu)

            game.scene.start(SCENE_KEYS.PRELOAD_SCENE)

            gameRef.current = game
        }

        startGame();

        return () => {
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