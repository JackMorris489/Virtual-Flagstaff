import * as Phaser from 'phaser';
import TextBoxUi from "../ui/TextBoxUi"
import { SCENE_KEYS } from './scene-keys';
import { EVENT_BUS } from '../common/event-bus';
import apiFetch from '../../../utils/apiFetch';

export class TutorialScene extends Phaser.Scene {
    #steps;
    #textBox;
    #currentStep;
    #playerContainer;
    #moveCheck

    constructor()
    {
        super({key: SCENE_KEYS.TUTORIAL_SCENE})
    }


    init(args)
    {
        this.#playerContainer = args.playerContainer;
    }


    create()
    {
        this.#currentStep = 0;
        this.#textBox = new TextBoxUi(this, 32, 142)
        this.#steps = [
            {
                text: "Welcome to the tutorial!\n\nPress Enter to continue!",
                onStart: () => this.waitForEnterPress()
            },
            {
                text: "Press the arrow keys to move!",
                onStart: () => this.#moveCheck = true
                
            },
            {
                text: "Go towards an NPC!",
                onStart: () => this.waitForPlayerInRangeOfNpc()
            },
            {
                text: "Press X to interact with NPCs and objects!\n\nWhen interacting with NPCs, keep pressing X to continue talking to them!",
                onStart: () => this.waitForNpcInteractionStart()
            },
            {
                text: "You've completed the tutorial!\n\nMove your character to end the tutorial.",
                onStart: () => this.waitForNpcInteractionEnd()
            }

        ]

        this.startStep(this.#steps[this.#currentStep]);
    }


    waitForNpcInteractionEnd()
    {
        EVENT_BUS.once("NPC_INTERACTION_END", () => {
            this.#textBox.show();
            this.#moveCheck = true;
        })
    }


    waitForNpcInteractionStart()
    {
        EVENT_BUS.once("NPC_INTERACTION_START", () => {
            this.nextStep();
            this.#textBox.hide();
        })
    }


    waitForPlayerInRangeOfNpc()
    {
        EVENT_BUS.once("PLAYER_IN_RANGE_OF_NPC", () => {
            this.nextStep();
        })
    }


    waitForPlayerMovement()
    {
        if (this.#moveCheck && this.playerMoved())
        {
            this.#moveCheck = false;
            this.nextStep();
        }
    }


    waitForEnterPress()
    {
        this.input.keyboard.once("keydown-ENTER", () => {
            this.nextStep();
        });
    }


    playerMoved()
    {
        const player = this.#playerContainer.list[0];
        return player.isMoving();
    }


    async submitPlayerCompletedTutorial()
    {
        let res;
        try
        {
            const user = await apiFetch(
                "/users/me",
                {
                    method: "PATCH",
                    credentials: "include",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify({completed_tutorial: true}
                    )
                }
            );
            res = user.completed_tutorial.toString();
        }

        catch
        {
            res = "false"
        }

        finally
        {
            localStorage.setItem("playerCompletedTutorial", res)
        }
    }


    nextStep()
    {
        this.#currentStep += 1;
        if (this.#currentStep !== this.#steps.length)
        {
            this.startStep(this.#steps[this.#currentStep])
        }

        else
        {
            this.#textBox.hide();
            this.submitPlayerCompletedTutorial()
        }
    }


    startStep(step)
    {
        this.#textBox.text = step.text;
        this.#textBox.show();
        step.onStart();
    }


    update()
    {
        this.waitForPlayerMovement();
    }
}