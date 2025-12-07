import { ENABLE_LOGGING } from "../../common/config";

export class StateInterface {
    stateMachine;
    name;
    onEnter;
    onUpdate;
}

export class StateMachine {
    #id;
    #states;
    #currentState;
    #isChangingState;
    #changingStateQueue;

    constructor(id){
        if (id == undefined){
            this.#id = Phaser.Math.RND.uuid();
        }
        else {
            this.#id  = id;
        }
        this.#isChangingState = false;
        this.#changingStateQueue = [];
        this.#currentState = undefined;
        this.#states = new Map();
    }

    update() {
        const queuedState = this.#changingStateQueue.shift();
        if (queuedState !== undefined) {
            this.setState(queuedState.state, queuedState.args);
            return;
        }

        if (this.#currentState && this.#currentState.onUpdate) {
            this.#currentState.onUpdate();
        }
    }

    setState(name, args) {
        const methodName = 'setState';
        if (!this.#states.has(name)) {
            console.warn(`[${StateMachine.name}-${this.#id}:${methodName}] tried to change to uknown state ${name}`)
            return;
        }
        if (this.#isCurrentState(name)) {
            return;
        }
        if (this.#isChangingState) {
            this.#changingStateQueue.push({name, args});
            return;
        }

        this.#isChangingState = true;
        this.#log(methodName, `change from ${this.#currentState?.name ?? 'none'} to ${name}`) 
        this.#currentState = this.#states.get(name);

        if (this.#currentState.onEnter) {
            this.#currentState.onEnter(args);
        }

        this.#isChangingState = false;
    }

    addState(state) {
        state.stateMachine = this;
        this.#states.set(state.name, state);
    }

    #isCurrentState(name) {
        if(!this.#currentState) {
            return false;
        }
        return this.#currentState.name === name;
    }

    #log(methodName, message) {
        if (ENABLE_LOGGING) {
            console.log(`[${StateMachine.name}-${this.#id}:${methodName}] ${message}`) 
        }
    }

    get userId() {
        return this.#id;
    }
}