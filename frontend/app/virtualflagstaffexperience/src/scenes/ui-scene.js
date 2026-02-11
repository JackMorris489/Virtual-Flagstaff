import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS, ASSET_PACK_KEYS } from '../common/assets';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';
import { KeyboardComponent } from '../components/input/keyboard-component';

/** 
    The UI scene is where all the dialog and user interfaces are stored. This allows them
    to be carried over between scenes. The UI scene also is where scene transition 
    commands occur (for now). 
**/
export class UiScene extends Phaser.Scene {
    #hudContainer;
    #dialogueContainer;
    #dialogueContainerText;
    #weatherContainer;
    #weatherContainerText;
    weather
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

        this.#weatherContainer = this.add.container(0, 0, [
            this.add.image(0, 0, ASSET_KEYS.UI_DIALOG, 0).setOrigin(0)
        ]);
        this.#weatherContainerText = this.add.text(14, 14, 'Loading Weather...', DEFAULT_UI_TEXT_STYLE).setOrigin(0);

        this.#weatherContainer.add(this.#weatherContainerText);
        this.#weatherContainer.setVisible(true);
        
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
        this.getWeatherData().then((result) => {
            this.weather = result;
            console.log(this.weather);

            switch(this.weather) {
                case `Sunny`: 
                    this.worldscene.overlayImage.fillColor = 0xFFFF00;
                    break;

                case `Partly Sunny`: 
                    this.worldscene.overlayImage.fillColor = 0xAAAA00;
                    break;

                case `Snowing`:
                    this.worldscene.overlayImage.fillColor = 0xFFFFFF;
                    break;

                default:
                    this.worldscene.overlayImage.fillColor = 0x00FF00;
                    break;
            }
            console.log(this.worldscene.overlayImage.fillColor.toString(16));
        }).catch((error) => {
            console.error(error);
        });
        
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
                forecast,
                temperature,
            } = weather

            this.#weatherContainerText.setText(
                `${forecast}\n` + `Temp: ${temperature}°F\n`
            );

            return forecast;
        } 
        catch (error) {
            console.error('Fetch problem:', error);
            this.#weatherContainerText.setText('Weather unavailable');
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
