import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS } from '../common/assets';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';

export class UiScene extends Phaser.Scene {
    #hudContainer;
    #dialogueContainer;
    #dialogueContainerText;
    skiscene;
    worldscene;
    #controls;

    constructor() {
        super({
            key: SCENE_KEYS.UI_SCENE,
        });
    }

    create() {
        // create the dialog box
        this.#dialogueContainer = this.add.container(32, 142, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)
        ]);
        this.#dialogueContainerText = this.add.text(14, 14, '', DEFAULT_UI_TEXT_STYLE).setOrigin(0);

        this.#dialogueContainer.add(this.#dialogueContainerText);
        this.#dialogueContainer.setVisible(false);

        // register event listeners
        EVENT_BUS.on(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
        EVENT_BUS.on(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);

        this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            EVENT_BUS.off(CUSTOM_EVENTS.SHOW_DIALOG, this.showDialog, this);
            EVENT_BUS.off(CUSTOM_EVENTS.CLOSE_DIALOG, this.closeDialog, this);
        })

        this.#controls = new KeyboardComponent(this.input.keyboard);
        this.skiscene = this.scene.get(SCENE_KEYS.SKI_GAME);
        this.worldscene = this.scene.get(SCENE_KEYS.GAME_SCENE);
    }

    update() {
        // TODO: REWORK SCENE TRANSITIONS
        if (this.skiscene.scene.isPaused() && this.#controls.isEscapeJustDown) {
            // unpause the ski scene (so it can sleep)
            this.skiscene.scene.resume();

            // switch to the overworld scene
            this.skiscene.scene.switch(this.worldscene);

            // close dialog
            this.closeDialog();
        }

        if (this.skiscene.scene.isPaused() && this.#controls.isEnterJustDown) {
            // restart the game
            this.skiscene.scene.restart();

            // close dialog
            this.closeDialog();
        }
    }

    showDialog(message) {
        // set the text
        this.#dialogueContainerText.setText(message);

        // set the visability
        this.#dialogueContainer.setVisible(true);
    }

    closeDialog() {
        // set the text
        this.#dialogueContainerText.setText('');

        // set the visability
        this.#dialogueContainer.setVisible(false);
    }
}