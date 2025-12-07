import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS } from '../common/assets';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';

export class UiScene extends Phaser.Scene {
    #hudContainer
    #dialogueContainer
    #dialogueContainerText

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