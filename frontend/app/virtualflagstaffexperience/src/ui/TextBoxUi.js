import { ASSET_KEYS } from "../common/assets";
import { DEFAULT_UI_TEXT_STYLE } from '../common/common';

export default class TextBoxUi
{
    #scene;
    #container;
    #text;
    #background

    constructor(scene, x, y)
    {
        this.#scene = scene;

        this.#background = this.#scene.add.image(0, 0, ASSET_KEYS.UI_DIALOG).setOrigin(0);

        this.#container = this.#scene.add.container(x, y, [this.#background]);

        this.#text = this.#scene.add.text(
            20, 
            20, 
            '', 
            {
                ...DEFAULT_UI_TEXT_STYLE,
                wordWrap: { width: 360 },
                align: 'center'
            }
        ).setOrigin(0);

        this.#container.add(this.#text);

        this.hide();
    }

    set text(t)
    {
        this.#text.setText(t);

        this.formatTextToContainer();
    }

    formatTextToContainer()
    {
        const paddingX = 40;
        const paddingY = 40;

        const textWidth = this.#text.width;
        const textHeight = this.#text.height;

        const targetWidth = textWidth + paddingX;
        const targetHeight = textHeight + paddingY;

        const baseWidth = this.#background.width;
        const baseHeight = this.#background.height;

        this.#background.setScale(
            Math.max(1, targetWidth / baseWidth),
            Math.max(1, targetHeight / baseHeight)
        );
    }

    show()
    {
        this.#container.setVisible(true)
    }

    hide()
    {
        this.#container.setVisible(false)
    }

    destroy()
    {
        this.#container.destroy();
    }
}