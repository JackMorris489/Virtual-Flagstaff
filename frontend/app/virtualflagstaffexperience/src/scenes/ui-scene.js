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
    #pauseContainer;
    #isPaused = false;
    #volume = 1;

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

            // switch(this.weather.toLowerCase()) {
            //     case `Sunny`: 
            //         this.worldscene.overlayImage.fillColor = 0xFFFF00;
            //         break;

            //     case `Partly Sunny`: 
            //         this.worldscene.overlayImage.fillColor = 0xAAAA00;
            //         break;

            //     case `Snowing`:
            //         this.worldscene.overlayImage.fillColor = 0xFFFFFF;
            //         break;

            //     default:
            //         this.worldscene.overlayImage.fillColor = 0x00FF00;
            //         break;
            // }

            const lowerCasedWeather = this.weather.toLowerCase()
            if (lowerCasedWeather.includes("sun"))
            {
                this.worldscene.overlayImage.fillColor = 0xFFFF00;
            }
            else if (lowerCasedWeather.includes("cloud"))
            {
                this.worldscene.overlayImage.fillColor = 0x808080;
            }
            else if (lowerCasedWeather.includes("snow"))
            {
                this.worldscene.overlayImage.fillColor = 0xFFFFFF;
            }
            else if (lowerCasedWeather.includes("rain"))
            {
                this.worldscene.overlayImage.fillColor = 0x0000FF;
            }
            console.log(this.worldscene.overlayImage.fillColor.toString(16));
        }).catch((error) => {
            console.error(error);
        });
        // Pause menu
        this.createPauseMenu();

    }

    update() {

            // ESC pause toggle
        if (this.#controls.isEscapeJustDown) {
            this.togglePause();
            return;
        }

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

    createPauseMenu() {

        const { width, height } = this.scale;

        this.#pauseContainer = this.add.container(width / 2, height / 2);

        //  SCREEN DIM 
        const dim = this.add.rectangle(
            0, 0,
            width,
            height,
            0x000000,
            0.65
        ).setOrigin(0.5);

        //  PANEL WITH YELLOW BORDER 
        const panel = this.add.rectangle(
            0,
            0,
            460,
            420,
            0x111111,
            0.95
        )
            .setStrokeStyle(4, 0xffd700) // ⭐ yellow border
            .setOrigin(0.5);

        //  TITLE 
        const title = this.add.text(0, -170, 'PAUSED', {
            fontSize: '42px',
            color: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        //  CONTROLS  
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

        //  VOLUME 
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

        //  RESUME BUTTON 
        const resumeBtn = this.createButton(0, 110, 'Resume', () => {
            this.togglePause();
        });

        //  EXIT BUTTON 
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
            } = weather

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
