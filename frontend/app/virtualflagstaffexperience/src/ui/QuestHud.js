import TextBoxUi from "./TextBoxUi";
import apiFetch from "../../../utils/apiFetch";

export default class QuestHUD
{
    #scene;
    #textBox;

    constructor(scene, x, y)
    {
        this.#scene = scene;
        this.#textBox = new TextBoxUi(this.#scene, x, y);
    }

    async init()
    {
        await this.refresh();
    }

    async getUserQuests()
    {
        return await apiFetch("/users/me/quests", {credentials: "include"});
    }
    
    async refresh()
    {
        try {
            const quests = await this.getUserQuests();
            
            if (quests.length > 0) {
                const quest = quests[0];
                
                this.#textBox.text = this.formatQuest(quest);

                this.#textBox.show();
            }

            else
            {
                this.#textBox.hide();
            }

        } catch (err) {
            console.error(err);
            this.#textBox.hide();
        }
    }


    formatQuest(quest)
    {
        return (
            "Active Quest:\n\n" +
            `Name: ${quest.name}\n\n` +
            `Description: ${quest.description}`
        )
    }
}