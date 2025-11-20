export class InputComponent {
    #up;
    #down;
    #left;
    #right;
    #actionKey;
    #selectKey;
    #enterKey;
    #escapeKey;

    constructor() {
        this.#up = false;
        this.#down = false;
        this.#left = false;
        this.#right = false;
        this.#actionKey = false;
        this.#selectKey = false;
        this.#enterKey = false;
        this.#escapeKey = false;
    };

    // get/set for up key
    get isUpDown() {
        return this.#up;
    };

    set isUpDown(val) {
        this.#up = val;
    };

    get isUpJustDown() {
        return this.#up;
    };

    // get/set for down key
    get isDownDown() {
        return this.#down;
    };

    set isDownDown(val) {
        this.#down = val;
    };

    get isDownJustDown() {
        return this.#down;
    };

    // get/set for left key
    get isLeftDown() {
        return this.#left;
    };

    set isLeftDown(val) {
        this.#left = val;
    };

    get isLeftJustDown() {
        return this.#left;
    };

    // get/set for right key
    get isRightDown() {
        return this.#right;
    };

    set isRightDown(val) {
        this.#right = val;
    };

    get isRighJusttDown() {
        return this.#right;
    };

    // get/set for action key
    get isActionJustDown() {
        return this.#actionKey;
    };

    set isActionJustDown(val) {
        this.#actionKey = val;
    };

    // get/set for select key
    get isSelectJustDown() {
        return this.#selectKey;
    };

    set isSelectJustDown(val) {
        this.#selectKey = val;
    };

    // get/set for enter key
    get isSelectJustDown() {
        return this.#enterKey;
    };

    set isSelectJustDown(val) {
        this.#enterKey = val;
    };

    // get/set for escape key
    get isSelectJustDown() {
        return this.#escapeKey;
    };

    set isSelectJustDown(val) {
        this.#escapeKey = val;
    };

    reset() {
        this.#up = false;
        this.#down = false;
        this.#left = false;
        this.#right = false;
        this.#actionKey = false;
        this.#selectKey = false;
        this.#enterKey = false;
        this.#escapeKey = false;
    }
}