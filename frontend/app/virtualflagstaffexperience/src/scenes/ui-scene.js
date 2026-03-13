import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';

export class UiScene extends Phaser.Scene {
    #hudContainer;
    #dialogueContainer;
    #dialogueContainerText;
    #weatherContainer;
    #weatherContainerText;
    dialogBackground;
    weather;
    skiscene;
    worldscene;
    #controls;
    #pauseContainer;
    #isPaused = false;
    #enterKey;
    #escKey;

    #questContainer;
    #questText;

    constructor() {
        super({
            key: SCENE_KEYS.UI_SCENE,
        });
    }

    createDialogUi()
    {
        this.dialogBackground = this.add.image(0, 0, ASSET_KEYS.UI_DIALOG).setOrigin(0);

        this.#dialogueContainer = this.add.container(32, 142, [
            this.dialogBackground
        ]);

        this.#dialogueContainerText = this.add.text(20, 20, '', {
            ...DEFAULT_UI_TEXT_STYLE,
            wordWrap: { width: 360 },
            align: 'center'
        }).setOrigin(0);

        this.#dialogueContainer.add(this.#dialogueContainerText);
        this.#dialogueContainer.setVisible(false);
    }

    createWeatherUi()
    {
        this.#weatherContainer = this.add.container(0, 0, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)
        ]);
        this.#weatherContainerText = this.add.text(14, 14, 'Loading Weather...', DEFAULT_UI_TEXT_STYLE).setOrigin(0);

        this.#weatherContainer.add(this.#weatherContainerText);
        this.#weatherContainer.setVisible(true);
    }

    setupEventListeners()
    {
        EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
        });
    }

    setupInput()
    {
        this.#controls = new KeyboardComponent(this.input.keyboard);
        this.#enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
        this.#escKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    }

    setupSceneReferences()
    {
        this.skiscene = this.scene.get(SCENE_KEYS.SKI_GAME);
        this.worldscene = this.scene.get(SCENE_KEYS.GAME_SCENE);
    }

    loadWeather()
    {
        this.getWeatherData().then((result) => {
            this.weather = result;
            console.log(this.weather);

            const lowerCasedWeather = this.weather.toLowerCase();

            if (lowerCasedWeather.includes('sun')) {
                this.worldscene.overlayImage.fillColor = 0xFFFF00;
            } else if (lowerCasedWeather.includes('cloud')) {
                this.worldscene.overlayImage.fillColor = 0x808080;
            } else if (lowerCasedWeather.includes('snow')) {
                this.worldscene.overlayImage.fillColor = 0xFFFFFF;
            } else if (lowerCasedWeather.includes('rain')) {
                this.worldscene.overlayImage.fillColor = 0x0000FF;
            }

            console.log(this.worldscene.overlayImage.fillColor.toString(16));
        }).catch((error) => {
            console.error(error);
        });
    }

    create() {
        this.createDialogUi()
        this.createWeatherUi()
        this.setupEventListeners()
        this.setupInput()
        this.setupSceneReferences()
        this.loadWeather()
        this.createPauseMenu();
    }

    update() {
        const enterJustDown = Phaser.Input.Keyboard.JustDown(this.#enterKey);
        const escJustDown = Phaser.Input.Keyboard.JustDown(this.#escKey);
        const skiPaused = this.skiscene && this.skiscene.scene.isPaused();
        const dialogVisible = this.#dialogueContainer.visible;

        // Handle ski dialog controls FIRST so ESC does not open the pause menu.
        if (skiPaused && dialogVisible) {
            if (enterJustDown) {
                if (typeof this.skiscene.onEnterPressed === 'function') {
                    this.skiscene.onEnterPressed();
                } else {
                    this.skiscene.scene.restart();
                }

                this.closeDialog();
                return;
            }

            if (escJustDown) {
                this.returnToWorldFromSki();
                return;
            }

            return;
        }

        // Normal pause toggle only when not using ski dialog.
        if (escJustDown) {
            this.togglePause();
            return;
        }
    }

    returnToWorldFromSki() {
        this.closeDialog();

        this.#isPaused = false;
        if (this.#pauseContainer) {
            this.#pauseContainer.setVisible(false);
        }

        if (this.skiscene && this.skiscene.scene.isPaused()) {
            this.skiscene.scene.resume();
        }

        if (this.skiscene) {
            this.skiscene.scene.switch(SCENE_KEYS.GAME_SCENE);
        }
    }

    createPauseMenu() {
        const { width, height } = this.scale;

        this.#pauseContainer = this.add.container(width / 2, height / 2);

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

        const currentVolume = this.sound.volume ?? 1;
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
            this.sound.volume = value;
        });

        const resumeBtn = this.createButton(0, 110, 'Resume', () => {
            this.togglePause();
        });

        const exitBtn = this.createButton(0, 170, 'Exit to Menu', () => {
            this.#isPaused = false;

            if (this.worldscene) this.worldscene.scene.stop();
            if (this.skiscene) this.skiscene.scene.stop();

            window.location.href = '/';
        });

        this.#pauseContainer.add([
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

        this.#pauseContainer.setDepth(9999);
        this.#pauseContainer.setVisible(false);
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
        });

        btn.on('pointerout', () => {
            btn.setStyle({
                backgroundColor: '#222222',
                color: '#ffffff'
            });
        });

        btn.on('pointerdown', callback);

        return btn;
    }

    togglePause() {
        this.#isPaused = !this.#isPaused;

        if (this.#isPaused) {
            if (!this.worldscene.scene.isPaused()) {
                this.worldscene.scene.pause();
            }

            if (!this.skiscene.scene.isPaused()) {
                this.skiscene.scene.pause();
            }

            this.#pauseContainer.setVisible(true);
        } else {
            if (this.worldscene.scene.isPaused()) {
                this.worldscene.scene.resume();
            }

            if (this.skiscene.scene.isPaused()) {
                this.skiscene.scene.resume();
            }

            this.#pauseContainer.setVisible(false);
        }
    }

    async getWeatherData() {
        const url = 'http://localhost:8000/weather';

        try {
            this.#weatherContainerText.setText('Loading Weather...');

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.statusText);
            }

            const weather = await response.json();

            const {
                shortForecast,
                temperature,
                temperatureUnit,
            } = weather;

            this.#weatherContainerText.setText(
                `${shortForecast}\n` + `Temp: ${temperature}°${temperatureUnit}\n`
            );

            return shortForecast;
        }
        catch (error) {
            console.error('Fetch problem:', error);
            this.#weatherContainerText.setText('Weather unavailable');
        }
    }

    showDialog(message) {
        this.#dialogueContainerText.setText(message);

        if (!this.dialogBackground) {
            console.error('dialogBackground is not initialized');
            this.#dialogueContainer.setVisible(true);
            return;
        }

        const paddingX = 40;
        const paddingY = 40;

        const textWidth = this.#dialogueContainerText.width;
        const textHeight = this.#dialogueContainerText.height;

        const targetWidth = textWidth + paddingX;
        const targetHeight = textHeight + paddingY;

        const baseWidth = this.dialogBackground.width;
        const baseHeight = this.dialogBackground.height;

        this.dialogBackground.setScale(
            Math.max(1, targetWidth / baseWidth),
            Math.max(1, targetHeight / baseHeight)
        );

        this.#dialogueContainer.setVisible(true);
    }

    closeDialog() {
        this.#dialogueContainerText.setText('');
        this.#dialogueContainer.setVisible(false);
    }
}