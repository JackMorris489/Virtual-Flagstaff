import { BaseGameObjectComponent } from "./base-game-object-component";

export class InteractingObjectsComponent extends BaseGameObjectComponent {
    objects;

    constructor(gameObject){
        super(gameObject);
    }

    get allObjects() {
        return this.objects;
    }

    add(gameObject) {
        this.objects.push(gameObject);
    }

    reset() {
        this.objects = [];
    }
}