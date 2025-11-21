import * as Phaser from 'phaser'
import { ControlsComponent } from '../../components/game-object/controls-component';
import { SpeedComponent } from '../../components/game-object/speed-component';
import { StateMachine } from '../../components/state-machine/state-machine';
import { CHARACTER_STATES } from '../../components/state-machine/states/character/character-states';
import { IdleState } from '../../components/state-machine/states/character/idle-state';
import { MoveState } from '../../components/state-machine/states/character/move-state';
import { DirectionComponent } from '../../components/game-object/direction-component';
import { AnimationComponent } from '../../components/game-object/animation-component';

export class CharacterGameObject extends Phaser.Physics.Arcade.Sprite {
    _controlsComponent;
    _speedComponent;
    _directionComponent;
    _animationComponent;
    _stateMachine;
    _isPlayer;

    constructor(config){
        const { scene, position, assetKey, frame, speed, animationConfig, inputComponent, id, isPlayer } = config;
        const { x, y } = position;
        super(scene, x, y, assetKey, frame || 0);

        // add physics
        scene.add.existing(this);
        scene.physics.add.existing(this);

        // set up components
        this._controlsComponent = new ControlsComponent(this, inputComponent);
        this._speedComponent = new SpeedComponent(this, speed);
        this._directionComponent = new DirectionComponent(this);
        this._animationComponent = new AnimationComponent(this, animationConfig);

        // create the state machine
        this._stateMachine = new StateMachine(id);

        // general config
        this._isPlayer = isPlayer;

        // make the body unpushable
        this.body.pushable = false;
    };

    get isNPC() {
        return !this._isPlayer;
    }

    get controls() {
        return this._controlsComponent.controls;
    }

    get speed() {
        return this._speedComponent.speed;
    }

    get direction() {
        return this._directionComponent.direction;
    }

    set direction(value) {
        this._directionComponent.direction = value;
    }

    get animationComponent() {
        return this._animationComponent;
    }

    update() {
        this._stateMachine.update();
    }
}