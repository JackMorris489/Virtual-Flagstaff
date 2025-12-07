import { StateInterface } from "../../state-machine";

export class SkiBaseCharacterState {
    _gameObject;
    _stateMachine;
    #name;

    constructor(name, gameObject) {
        this.#name = name;
        this._gameObject = gameObject;
    }

    get name() {
        return this.#name;
    }

    set stateMachine(stateMachine) {
        this._stateMachine = stateMachine;
    }
}