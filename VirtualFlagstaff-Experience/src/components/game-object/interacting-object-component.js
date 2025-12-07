import { BaseGameObjectComponent } from "./base-game-object-component";

export class InteractingObjectComponent extends BaseGameObjectComponent {
    object;

    constructor(gameObject){
        super(gameObject);
    }

    get object() {
        return this.object;
    }

    set(gameObject) {
        this.object = gameObject;
    }
}