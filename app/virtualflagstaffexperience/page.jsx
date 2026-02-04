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

export default function VirtualFlagstaff() {
    const gameRef = useRef(null)

    useEffect(() => {
        if (typeof window === 'undefined') return
        if (gameRef.current) return // prevent double init (StrictMode)

        const game = new Phaser.Game(gameConfig)

        game.scene.add(SCENE_KEYS.PRELOAD_SCENE, PreloadScene)
        game.scene.add(SCENE_KEYS.GAME_SCENE, Overworld)
        game.scene.add(SCENE_KEYS.SKI_GAME, SkiGame)
        game.scene.add(SCENE_KEYS.UI_SCENE, UiScene)
        game.scene.start(SCENE_KEYS.PRELOAD_SCENE)

        gameRef.current = game

        return () => {
            game.destroy(true)
            gameRef.current = null
        }
    }, [])

    return (
        <div id="game-container"/>
    )
}