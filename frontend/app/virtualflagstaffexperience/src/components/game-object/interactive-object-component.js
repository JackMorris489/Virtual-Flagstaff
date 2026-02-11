import { BaseGameObjectComponent } from "./base-game-object-component";

export class InteractiveObjectComponent extends BaseGameObjectComponent {
    #objectType;
    #callback;
    #canInteractCheck;

    constructor(
        gameObject, 
        objectType, 
        callback = () => undefined,
        canInteractCheck = () => true, 
    ){
        super(gameObject);
        this.#objectType = objectType;
        this.#callback = callback;
        this.#canInteractCheck = canInteractCheck;
    }

    get objectType() {
        return this.#objectType;
    }

    runInteract() {
        this.#callback();
    }

    canInteractWith() {
        return this.#canInteractCheck();
    }
}