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
    skiendlessscene;
    worldscene;
    #controls;
    #pauseContainer;
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

    init(args)
    {
        this.playerContainer = args.playerContainer
    }


    preload()
    {
        this.load.audio("hoverSfx", "/sfx/menu-hover.wav")
        this.load.audio("clickSfx", "/sfx/menu-click.wav")
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
        this.scene.launch(SCENE_KEYS.TUTORIAL_SCENE, {
            playerContainer: this.playerContainer
        });
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


    resumeScene(sceneKey)
    {
        if (this.scene.isPaused(sceneKey))
        {
            this.scene.resume(sceneKey);
        }
    }


    resumeGame()
    {
        this.resumeScene(SCENE_KEYS.GAME_SCENE);
        this.resumeScene(SCENE_KEYS.SKI_GAME);
        this.resumeScene(SCENE_KEYS.TUTORIAL_SCENE);

        this.scene.stop(SCENE_KEYS.PAUSE_MENU);
    }


    pauseScene(sceneKey)
    {
        if (this.scene.isActive(sceneKey))
        {
            this.scene.pause(sceneKey);
        }
    }


    pauseGame()
    {
        this.pauseScene(SCENE_KEYS.GAME_SCENE);
        this.pauseScene(SCENE_KEYS.SKI_GAME);
        this.pauseScene(SCENE_KEYS.TUTORIAL_SCENE);

        this.scene.launch(SCENE_KEYS.PAUSE_MENU);
    }


    setupEventListeners()
    {
        EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.REFRESH_QUESTS, this.refreshQuestUi, this);
        this.pauseMenu.events.on("RESUME_GAME", this.resumeGame, this)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.REFRESH_QUESTS, this.refreshQuestUi, this);
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
        // this.skiendlessscene = this.scene.get(SCENE_KEYS.SKI_GAME_ENDLESS);
        this.worldscene = this.scene.get(SCENE_KEYS.GAME_SCENE);
        this.tutorialScene = this.scene.get(SCENE_KEYS.TUTORIAL_SCENE);
        this.pauseMenu = this.scene.get(SCENE_KEYS.PAUSE_MENU);
    }

    async getUserQuests()
    {
        return await apiFetch("/users/me/quests", {
            method: "GET",
            credentials: "include"
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

    playerCompletedTutorial()
    {
        return localStorage.getItem("playerCompletedTutorial") === "true";
    }

    create() {
        this.setupSceneReferences();
        this.createDialogUi();
        this.createWeatherUi();
        this.createQuestUi();
        this.setupEventListeners();
        this.setupInput();
        
        // this.createPauseMenu();
        if (!this.playerCompletedTutorial())
        {
            this.createTutorialUi();
        }
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

        if (this.#pauseContainer) {
            this.#pauseContainer.setVisible(false);
        }

        if (this.skiscene && this.skiscene.scene.isPaused()) {
            this.skiscene.scene.resume();
        }

        if (this.skiscene) {
            this.skiscene.scene.switch(SCENE_KEYS.GAME_SCENE);
        }

        // if (this.skiendlessscene.scene.isPaused() && this.#controls.isEscapeJustDown) {
        //     // unpause the ski scene (so it can sleep)
        //     this.skiendlessscene.scene.resume();

        //     // switch to the overworld scene
        //     this.skiendlessscene.scene.switch(this.worldscene);

        //     // close dialog
        //     this.closeDialog();
        // }

        // if (this.skiendlessscene.scene.isPaused() && this.#controls.isEnterJustDown) {
        //     // restart the game
        //     this.skiendlessscene.scene.restart();

        //     // close dialog
        //     this.closeDialog();
        // }
    }


    togglePause() {
        if (this.scene.isActive(SCENE_KEYS.PAUSE_MENU))
        {
            this.resumeGame();
        }

        else
        {
            this.pauseGame();
        }
        // this.#isPaused = !this.#isPaused;

        // if (this.#isPaused) {
        //     if (!this.worldscene.scene.isPaused()) {
        //         this.worldscene.scene.pause();
        //     }

        //     if (!this.skiscene.scene.isPaused()) {
        //         this.skiscene.scene.pause();
        //     }

        //     this.#pauseContainer.setVisible(true);
        // } else {
        //     if (this.worldscene.scene.isPaused()) {
        //         this.worldscene.scene.resume();
        //     }

        //     if (this.skiscene.scene.isPaused()) {
        //         this.skiscene.scene.resume();
        //     }

        //     this.#pauseContainer.setVisible(false);
        // }
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
}
