import * as Phaser from "phaser"
import { SCENE_KEYS } from "./scene-keys"

export class PauseMenu extends Phaser.Scene
{
    #container

    constructor()
    {
        super({key: SCENE_KEYS.PAUSE_MENU})
    }

    create()
    {
        this.hoverSfx = this.sound.add("hoverSfx", { volume: this.sound.volume ?? 1 });
        this.clickSfx = this.sound.add("clickSfx", { volume: this.sound.volume ?? 1 });

        const { width, height } = this.scale;
        
        this.#container = this.add.container(width / 2, height / 2);

        const dim = this.add.rectangle(
            0, 0,
            width,
            height,
            0x000000,
            0.65
        ).setOrigin(0.5);

        const panel = this.add.rectangle(
            0,
            0,
            460,
            420,
            0x111111,
            0.95
        )
            .setStrokeStyle(4, 0xffd700)
            .setOrigin(0.5);

        const title = this.add.text(0, -170, 'PAUSED', {
            fontSize: '42px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        const controlsTitle = this.add.text(0, -110, 'Controls', {
            fontSize: '22px',
            color: '#ffd700'
        }).setOrigin(0.5);

        const controlsText = this.add.text(
            0,
            -70,
            'Arrows  -  Move\nX  -  Interact\nESC  -  Pause',
            {
                fontSize: '18px',
                color: '#cccccc',
                align: 'center'
            }
        ).setOrigin(0.5);

        const volumeLabel = this.add.text(0, -10, 'Volume', {
            fontSize: '22px',
            color: '#ffd700'
        }).setOrigin(0.5);

        const sliderWidth = 240;
        const min = -sliderWidth / 2;
        const max = sliderWidth / 2;

        const currentVolume = Number(localStorage.getItem("globalVolume")) ?? 1;
        const startX = min + (currentVolume * (max - min));

        const sliderTrack = this.add.rectangle(
            0,
            30,
            sliderWidth,
            8,
            0xffffff
        ).setOrigin(0.5);

        const sliderHandle = this.add.circle(
            startX,
            30,
            12,
            0xffd700
        ).setInteractive({ draggable: true });

        this.input.setDraggable(sliderHandle);

        sliderHandle.on('drag', (pointer, dragX) => {
            const clamped = Phaser.Math.Clamp(dragX, min, max);
            sliderHandle.x = clamped;

            const value = (clamped - min) / (max - min);
            this.sound.setVolume(value);
            localStorage.setItem("globalVolume", this.sound.volume.toString())
        });

        const resumeBtn = this.createButton(0, 110, 'Resume', () => {
            this.events.emit("RESUME_GAME")
        });

        const exitBtn = this.createButton(0, 170, 'Exit to Menu', () => {
            // if (this.worldScene) this.worldScene.scene.stop();
            // if (this.skiScene) this.skiScene.scene.stop();

            window.location.href = '/';
        });

        this.#container.add([
            dim,
            panel,
            title,
            controlsTitle,
            controlsText,
            volumeLabel,
            sliderTrack,
            sliderHandle,
            resumeBtn,
            exitBtn
        ]);

        this.#container.setDepth(9999);
    }

    createButton(x, y, label, callback) {
        const btn = this.add.text(x, y, label, {
            fontSize: '22px',
            color: '#ffffff',
            backgroundColor: '#222222',
            padding: { x: 14, y: 8 }
        })
            .setOrigin(0.5)
            .setInteractive({ useHandCursor: true });

        btn.on('pointerover', () => {
            btn.setStyle({
                backgroundColor: '#444444',
                color: '#ffff00'
            });

            this.hoverSfx.play();
        });

        btn.on('pointerout', () => {
            btn.setStyle({
                backgroundColor: '#222222',
                color: '#ffffff'
            });
        });

        btn.on('pointerdown', () => {
            this.clickSfx.play();
            callback();
        });

        return btn;
    }
}