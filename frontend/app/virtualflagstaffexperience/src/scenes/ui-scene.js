import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';
import apiFetch from '../../../utils/apiFetch';

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
    #volume = 1;
    #tutorialContainer;
    #tutorialContainerText;
    #interactPopup;
    #interactPopupText;
    #enterKey;
    #escKey;

    #questContainer;
    #questText;
    #questNameText;
    #questDescriptionText;

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


    handleOverlaySelection(forecast)
    {
        const lowerCasedForecast = forecast.toLowerCase();

        if (lowerCasedForecast.includes('sun')) 
        {
            this.worldscene.overlayImage.fillColor = 0xFFFF00;
        } 
        
        else if (lowerCasedForecast.includes('cloud')) 
        {
            this.worldscene.overlayImage.fillColor = 0x808080;
        } 
        
        else if (lowerCasedForecast.includes('snow')) 
        {
            this.worldscene.overlayImage.fillColor = 0xFFFFFF;
        } 
        
        else if (lowerCasedForecast.includes('rain')) 
        {
            this.worldscene.overlayImage.fillColor = 0x0000FF;
        }
    }


    createTutorialUi()
    {
        // create tutorial boxes
        this.#tutorialContainer = this.add.container(32, 300, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)
        ]);

        this.#tutorialContainerText = this.add.text(14, 14, 'Welcome to Virtual Flagstaff! Press The Arrow Keys To Move!', DEFAULT_UI_TEXT_STYLE).setOrigin(0);
        this.#tutorialContainer.add(this.#tutorialContainerText);
        this.#tutorialContainer.setVisible(true);

        this.#interactPopup = this.add.container(32, 300, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)
        ]); 
        this.#interactPopupText = this.add.text(14, 14, '', DEFAULT_UI_TEXT_STYLE).setOrigin(0);
        this.#interactPopup.add(this.#interactPopupText);
        this.#interactPopup.setVisible(false);
    }


    async createWeatherUi()
    {
        this.#weatherContainer = this.add.container(0, 0, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)
        ]);
        this.#weatherContainerText = this.add.text(14, 14, 'Loading Weather...', DEFAULT_UI_TEXT_STYLE).setOrigin(0);

        this.#weatherContainer.add(this.#weatherContainerText);
        this.#weatherContainer.setVisible(true);
       
        try
        {
            const {shortForecast, temperature, temperatureUnit} = await this.getWeather();

            this.#weatherContainerText.setText(
                `${shortForecast}\n` + `Temp: ${temperature}°${temperatureUnit}\n`
            );

            this.handleOverlaySelection(shortForecast)
        }

        catch (err)
        {
            this.#weatherContainerText.setText("Weather unavailable");
        }
    }

    setupEventListeners()
    {
        EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.REFRESH_QUESTS, this.refreshQuestUi, this);
        EVENT_BUS.on('PLAYER_MOVED', () => {
            this.#tutorialContainer.setVisible(false);
        })
        EVENT_BUS.on('PLAYER_INTERACTION_CLOSE', this.showInteractPopup, this);
        EVENT_BUS.on('PLAYER_INTERACTION_GONE', this.hideInteractPopup, this);
        // EVENT_BUS.on(CUSTOM_EVENTS.REFRESH_WEATHER, this.refreshWeatherUi, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.REFRESH_QUESTS, this.refreshQuestUi, this);
            EVENT_BUS.off('PLAYER_MOVED', () => {
                this.#tutorialContainer.setVisible(false);
            })
            EVENT_BUS.off('PLAYER_INTERACTION_CLOSE', this.showInteractPopup, this);
            EVENT_BUS.off('PLAYER_INTERACTION_GONE', this.hideInteractPopup, this);
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

    async getUserQuests()
    {
        return await apiFetch("/users/me/quests", {
            method: "GET",
            credentials: "include",
            headers: {"Content-Type": "application/json"},
        });
    }

    setQuestContainerText(name, description)
    {
        this.#questNameText.setText(name);
        this.#questDescriptionText.setText(description);
    }

    async refreshQuestUi()
    {
        try {
            const quests = await this.getUserQuests();

            if (quests.length > 0) {
                const quest = quests[0];

                this.setQuestContainerText(
                    `Name: ${quest.name}`, 
                    `Description: ${quest.description}`
                );
            }

            else
            {
                this.setQuestContainerText(
                    "Name: None", 
                    "Description: None"
                );
            }

        } catch (err) {
            if (err.status === 401)
            {
                this.setQuestContainerText("Login/Sign-up to get quests!", "");
            }
        }
    }

    async createQuestUi()
    {
        this.#questContainer = this.add.container(320, 0, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)
        ]);

        this.#questText = this.add.text(
            14,
            10,
            "Active Quest:",
            DEFAULT_UI_TEXT_STYLE
        ).setOrigin(0);

        this.#questNameText = this.add.text(
            14,
            30,
            "Name: None",
            DEFAULT_UI_TEXT_STYLE
        ).setOrigin(0);

        this.#questDescriptionText = this.add.text(
            14,
            50,
            "Description: None",
            DEFAULT_UI_TEXT_STYLE
        ).setOrigin(0);

        this.#questContainer.add([
            this.#questText,
            this.#questNameText,
            this.#questDescriptionText
        ]);

        try {
            const quests = await this.getUserQuests();

            if (quests.length > 0) {
                const quest = quests[0];

                this.setQuestContainerText(
                    `Name: ${quest.name}`, 
                    `Description: ${quest.description}`
                );
            }

        } catch (err) {
            if (err.status === 401)
            {
                this.setQuestContainerText("Login/Sign-up to get quests!", "");
            }
        }

        this.#questContainer.setVisible(true);
    }

    create() {
        this.createDialogUi();
        this.createWeatherUi();
        this.createTutorialUi();
        this.createQuestUi();
        this.setupEventListeners();
        this.setupInput();
        this.setupSceneReferences();
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

    async getWeather() {
        return await apiFetch("/weather");
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

    showInteractPopup(type) {
        let message = '';

        switch(type)
        {
            // adjust to proper interact buttons
            case INTERACTIVE_OBJECT_TYPE.PICKUP:
                message = 'X';
                break;
            case INTERACTIVE_OBJECT_TYPE.OPEN:
                message = 'Z';
                break;
            case INTERACTIVE_OBJECT_TYPE.DIALOG:
                message = 'X';
                break;
            case INTERACTIVE_OBJECT_TYPE.MINI_GAME:
                message = 'C';
                break;
            default: 
                message = 'X';
        }
        this.#interactPopupText.setText(message);
        this.#interactPopup.setVisible(true);
    }

    hideInteractPopup()
    {
        this.#interactPopup.setVisible(false);
    }
}
