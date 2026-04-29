import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';
import apiFetch from '../../../utils/apiFetch';
import WeatherHUD from '../ui/WeatherHUD';
import QuestHUD from '../ui/QuestHud';

export class UiScene extends Phaser.Scene {
    #hudContainer;
    #questHUD;
    #dialogueContainer;
    #dialogueContainerText;
    dialogBackground;
    weather;
    skiscene;
    wildlifescene;
    dinerScene;
    skiendlessscene;
    montevistascene;
    worldscene;
    #controls;
    #pauseContainer;
    #enterKey;
    #escKey;

    #weatherHUD;

    constructor() {
        super({
            key: SCENE_KEYS.UI_SCENE,
        });
    }

    init(args)
    {
        this.playerContainer = args.playerContainer
    }

    createDialogUi()
    {
        this.dialogBackground = this.add.image(0, 0, ASSET_KEYS.UI_DIALOG).setOrigin(0.5);

        this.#dialogueContainer = this.add.container(this.scale.width / 2, this.scale.height / 2, [
            this.dialogBackground
        ]);

        this.#dialogueContainerText = this.add.text(0, 0, '', {
            ...DEFAULT_UI_TEXT_STYLE,
            fontSize: 8,
            wordWrap: { width: 430 },
            align: 'center',
            lineSpacing: 3,
        }).setOrigin(0.5);

        this.#dialogueContainer.add(this.#dialogueContainerText);
        this.#dialogueContainer.setVisible(false);
    }


    createTutorialUi()
    {
        this.scene.launch(SCENE_KEYS.TUTORIAL_SCENE, {
            playerContainer: this.playerContainer
        });
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
        this.resumeScene(SCENE_KEYS.WILDLIFE_GAME);
        this.resumeScene(SCENE_KEYS.DINER_GAME);
        this.resumeScene(SCENE_KEYS.MONTE_VISTA_GAME);
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
        this.pauseScene(SCENE_KEYS.WILDLIFE_GAME);
        this.pauseScene(SCENE_KEYS.DINER_GAME);
        this.pauseScene(SCENE_KEYS.MONTE_VISTA_GAME);
        this.pauseScene(SCENE_KEYS.TUTORIAL_SCENE);

        this.scene.launch(SCENE_KEYS.PAUSE_MENU);
    }


    setupEventListeners()
    {
        EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.REFRESH_QUESTS, this.#questHUD.refresh, this.#questHUD);
        this.pauseMenu.events.on("RESUME_GAME", this.resumeGame, this)

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.REFRESH_QUESTS, this.#questHUD.refresh, this.#questHUD);
            this.pauseMenu.events.off("RESUME_GAME", this.resumeGame, this)
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
        this.wildlifescene = this.scene.get(SCENE_KEYS.WILDLIFE_GAME);
        this.dinerScene = this.scene.get(SCENE_KEYS.DINER_GAME);
        this.montevistascene = this.scene.get(SCENE_KEYS.MONTE_VISTA_GAME);
        this.worldscene = this.scene.get(SCENE_KEYS.GAME_SCENE);
        this.tutorialScene = this.scene.get(SCENE_KEYS.TUTORIAL_SCENE);
        this.pauseMenu = this.scene.get(SCENE_KEYS.PAUSE_MENU);
    }

    async createQuestUi()
    {
        this.#questHUD = new QuestHUD(this, 90, 375);
        this.#questHUD.init();
    }

    playerCompletedTutorial()
    {
        return localStorage.getItem("playerCompletedTutorial") === "true";
    }

    create() {
        this.setupSceneReferences();
        this.createDialogUi();
        this.#weatherHUD = new WeatherHUD(this, 0, 0);
        this.createQuestUi();
        this.setupEventListeners();
        this.setupInput();
        if (!this.playerCompletedTutorial())
        {
            this.createTutorialUi();
        }
    }

    update() {
        const enterJustDown = Phaser.Input.Keyboard.JustDown(this.#enterKey);
        const escJustDown = Phaser.Input.Keyboard.JustDown(this.#escKey);
        const skiPaused = this.skiscene && this.skiscene.scene.isPaused();
        const wildlifePaused = this.wildlifescene && this.wildlifescene.scene.isPaused();
        const pausedMiniGame = this.getPausedDialogMiniGameScene();
        const dialogVisible = this.#dialogueContainer.visible;

        // Handle mini-game dialog controls FIRST so ESC does not open the pause menu.
        if (pausedMiniGame && dialogVisible) {
            if (enterJustDown) {
                if (typeof pausedMiniGame.onEnterPressed === 'function') {
                    pausedMiniGame.onEnterPressed();
                } else {
                    pausedMiniGame.scene.restart();
                }

                this.closeDialog();
                return;
            }

            if (escJustDown) {
                this.returnToWorldFromMiniGame(pausedMiniGame);
                return;
            }

            return;
        }

        if (wildlifePaused && dialogVisible) {
            if (enterJustDown) {
                if (typeof this.wildlifescene.onEnterPressed === 'function') {
                    this.wildlifescene.onEnterPressed();
                } 
                else {
                    this.wildlifescene.scene.restart();
                }

                this.closeDialog();
                return;
            }

            if (escJustDown) {
                this.returnToWorldFromWildlife();
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
        this.returnToWorldFromMiniGame(this.skiscene);
    }

    returnToWorldFromMiniGame(miniGameScene = this.getPausedDialogMiniGameScene()) {
        this.closeDialog();

        if (this.#pauseContainer) {
            this.#pauseContainer.setVisible(false);
        }

        if (miniGameScene && miniGameScene.scene.isPaused()) {
            miniGameScene.scene.resume();
        }

        if (miniGameScene) {
            miniGameScene.scene.switch(SCENE_KEYS.GAME_SCENE);
        }
    }

    returnToWorldFromWildlife() {
        this.closeDialog();

        if (this.#pauseContainer) {
            this.#pauseContainer.setVisible(false);
        }

        if (this.wildlifescene && this.wildlifescene.scene.isPaused()) {
            this.wildlifescene.scene.resume();
        }

        if (this.wildlifescene) {
            this.wildlifescene.scene.switch(SCENE_KEYS.GAME_SCENE);
        }
    }


    getPausedDialogMiniGameScene() {
        const miniGameScenes = [this.skiscene, this.dinerScene, this.montevistascene];
        return miniGameScenes.find((scene) => scene && scene.scene.isPaused());
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
    }


    showDialog(message) {
        this.#dialogueContainerText.setText(message);
        this.#dialogueContainer.setPosition(this.scale.width / 2, this.scale.height / 2);

        if (!this.dialogBackground) {
            console.error('dialogBackground is not initialized');
            this.#dialogueContainer.setVisible(true);
            return;
        }

        const paddingX = 120;
        const paddingY = 92;

        const textWidth = this.#dialogueContainerText.width;
        const textHeight = this.#dialogueContainerText.height;

        const targetWidth = Phaser.Math.Clamp(textWidth + paddingX, 440, this.scale.width - 20);
        const targetHeight = Phaser.Math.Clamp(textHeight + paddingY, 236, this.scale.height - 24);

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
