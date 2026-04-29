import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { GameScene } from './game-scene';
import apiFetch from '../../../utils/apiFetch';

export class MonteVistaGame extends GameScene {
    #controls;
    player;
    uiScene;

    interactables = {};
    hasKey = false;

    constructor() {
        super({
            sceneKey: SCENE_KEYS.MONTE_VISTA_GAME,
            gameKey: 'MONTE_VISTA_GAME'
        });
    }

    async create() {
        this.scene.pause();
        this.#createRoom();
        this.#controls = new KeyboardComponent(this.input.keyboard);
        this.#createPlayer();
        this.#createInteractables();
        this.uiScene = this.scene.get(SCENE_KEYS.UI_SCENE);

        this.uiScene.showDialog(
            'Welcome to the Monte Vista Hotel...\n' +
            'You seem to be trapped! Find clues to escape.\n\n' +
            'X to interact\n' +
            'Press Enter to begin searching!'
        );

        this.isStartScreen = true;
    }

    update() {
        if(this.isStartScreen) return;

        this.#updatePlayerMovement();

        if(this.#controls.isActionJustDown) {
            this.#handleInteraction();
        }
    }

    onEnterPressed() {
        if(this.isStartScreen) {
            this.isStartScreen = false;
            this.scene.resume();
        }
    }



    #createRoom() {
        this.add.tileSprite(256, 232, 512, 464, ASSET_KEYS.MONTE_VISTA_FLOOR);
    }

    #createPlayer() {
        this.player = this.physics.add.sprite(256, 232, 'player');
        this.player.setCollideWorldBounds(true);
    }

    #createInteractables() {
        const createSpot = (x, y, key) => {
            const trigger = this.physics.add.image(x, y, '');
            const visual = this.add.image(x, y, key);

            return { trigger, visual };
        };

        this.interactables = {
            desk: createSpot(200, 180, ASSET_KEYS.MONTE_VISTA_DESK),
            painting: createSpot(350, 120, ASSET_KEYS.MONTE_VISTA_PAINTING),
            ghost: createSpot(120, 300, ASSET_KEYS.MONTE_VISTA_GHOST),
            safe: createSpot(400, 300, ASSET_KEYS.MONTE_VISTA_SAFE),
            exit: createSpot(256, 80, ASSET_KEYS.MONTE_VISTA_EXIT),
        };
    }

    #handleInteraction() {
        const range = 60;
        const check = (obj, callback) => {
            if(Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                obj.trigger.x,
                obj.trigger.y
            ) < range) {
                callback();
                return true;
            }
            return false;
        };

        const i = this.interactables;

        if(check(i.desk, () => this.#desk())) return;
        if(check(i.painting, () => this.#painting())) return;
        if(check(i.ghost, () => this.#ghost())) return;
        if(check(i.safe, () => this.#safe())) return;
        if(check(i.exit, () => this.#exit())) return;
    }

    #desk() {
        this.uiScene.showDialog(
            'You open the drawer at the desk...\n' +
            'There is an old note. You unravel it to read\n' +
            '"The safe contains the key to unlock the door and escape"'
        );
    }

    #painting() {
        this.uiScene.showDialog(
            'You admire the painting of the Monte Vista\n' +
            'Looking down at the bottom of the frame you notice a plaque\n' +
            'It states "The Monte Vista first opened its doors in 1927 on New Years Day."'
        );
    }

    #ghost() {
        this.uiScene.showDialog(
            'You talk to the creepy looking woman in the corner...\n\n' +
            'Ghost: "I have seen many famous guests stay here...\n' +
            'George Babbit, Siouxsie Sioux, Bing Crosby, and others.\n' +
            'Did you know that the Monte Vista cocktail lounge opened during the prohibition era?\n' +
            'I heard it acted as a newspaper publishing house to avoid getting caught"\n\n' +
            'The ghost seems to have done nothing but waste your time...'
        );
    }

    #safe() {
        this.#openKeypad();
    }

    #openKeypad() {
        this.scene.pause();

        let inputCode = '';

        const overlay = this.add.rectangle(256, 232, 512, 464, 0x000000, 0.6).setDepth(100);

        const panel = this.add.rectangle(256, 232, 260, 0x222222, 1).setStrokeStyle(3, 0xffffff).setDepth(101);

        const display = this.add.text(256, 150, '', {
            fontSize: '20px',
            color: '#ffffff',
            backgroundColor: '#000000',
            padding: { x:10, y:5 }
        }).setOrigin(0.5).setDepth(102);

        const buttons = [];
        const startX = 200;
        const startY = 200;
        const size = 50;
        let number = 1;

        for(let row = 0; row < 3; row++) {
            for(let col = 0; col < 3; col++) {
                const x = startX + col * size;
                const y = startY + row * size;

                const btn = this.add.rectangle(x, y, 40, 40, 0x444444).setInteractive().setDepth(102);

                const txt = this.add.text(x, y, number.toString(), {
                    fontSize: '18px',
                    color: '#ffffff'
                }).setOrigin(0.5).setDepth(103);

                btn.on('pointerdown', () => {
                    inputCode += number.toString();
                    display.setText(inputCode);
                });

                buttons.push(btn, txt);
                number++;
            }
        }

        const clearBtn = this.add.rectangle(210, 360, 60, 40, 0xaa3333)
            .setInteractive()
            .setDepth(102);

        const clearTxt = this.add.text(210, 360, 'C', {
            fontSize: '16px',
            color: '#fff'
        }).setOrigin(0.5).setDepth(103);

        clearBtn.on('pointerdown', () => {
            inputCode = '';
            display.setText('');
        });

        const enterBtn = this.add.rectangle(300, 360, 60, 40, 0x33aa33)
            .setInteractive()
            .setDepth(102);

        const enterTxt = this.add.text(300, 360, 'OK', {
            fontSize: '16px',
            color: '#fff'
        }).setOrigin(0.5).setDepth(103);

        enterBtn.on('pointerdown', () => {
            if (inputCode === '1927') {
                this.hasKey = true;
                this.uiScene.showDialog('The safe door swings open, you got the key!');
            } else {
                this.uiScene.showDialog('The lock beeps angrily... wrong code.');
            }

            cleanup();
            this.scene.resume();
        });

        const cleanup = () => {
            overlay.destroy();
            panel.destroy();
            display.destroy();

            buttons.forEach(obj => obj.destroy());

            clearBtn.destroy();
            clearTxt.destroy();
            enterBtn.destroy();
            enterTxt.destroy();
        };
    }

    #exit() {
        if(!this.hasKey) {
            this.uiScene.showDialog('You rattle the handle a few times... It is locked');
            return;
        }
        this.uiScene.showDialog(
            'You place the key you got from the safe into the lock...\n' +
            'It fits and the lock turns\n' +
            'You have escaped!'
        );
        this.submitGameSession.delayedCall(1500, () => {
            this.scene.start(SCENE_KEYS.GAME_SCENE);
        });
    }

    #updatePlayerMovement() {
        const speed = 100;
        const body = this.player.body;

        body.setVelocity(0);

        if(this.#controls.isLeftDown) body.setVelocityX(-speed);
        if(this.#controls.isRightDown) body.setVelocityX(speed);
        if(this.#controls.isUpDown) body.setVelocityY(-speed);
        if(this.#controls.isDownDown) body.setVelocityY(speed);
    }
}