import { InputComponent } from "./input-component";

export class KeyboardComponent extends InputComponent {
    #cursorKeys;
    #actionKey;
    #selectKey;
    #enterKey;
    #escapeKey;

    constructor(keyboardPlugin){
        super();

        this.#cursorKeys = keyboardPlugin.createCursorKeys();
        this.#actionKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.X);
        this.#selectKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
        this.#enterKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.C);
        this.#escapeKey = keyboardPlugin.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    };

    // get for up key
    get isUpDown() {
        return this.#cursorKeys.up.isDown;
    };

    get isUpJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.up.isDown);
    };

    // get for down key
    get isDownDown() {
        return this.#cursorKeys.down.isDown;
    };

    get isDownJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.down.isDown);
    };

    // get for left key
    get isLeftDown() {
        return this.#cursorKeys.left.isDown;
    };

    get isLeftJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.left.isDown);
    };

    // get for right key
    get isRightDown() {
        return this.#cursorKeys.right.isDown;
    };

    get isRightJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#cursorKeys.right.isDown);
    };

    // get for action key
    get isActionJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#actionKey);
    };

    // get for select key
    get isSelectJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#selectKey);
    };

    // get for enter key
    get isEnterJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#enterKey);
    };

    // get for escape key
    get isEscapeJustDown() {
        return Phaser.Input.Keyboard.JustDown(this.#escapeKey);
    };


}