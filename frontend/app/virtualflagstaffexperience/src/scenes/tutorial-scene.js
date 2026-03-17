import * as Phaser from 'phaser';
import TextBoxUi from "../ui/TextBoxUi"
import { SCENE_KEYS } from './scene-keys';

export class TutorialScene extends Phaser.Scene {
    #steps;
    #textBox;

    constructor()
    {
        super({key: SCENE_KEYS.TUTORIAL_SCENE})
    }


    create()
    {
        this.#textBox = new TextBoxUi(this, 32, 142)
        this.#textBox.text = "Welcome to the tutorial!"
        this.#textBox.show();
    }

}