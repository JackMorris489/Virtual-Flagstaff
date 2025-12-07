import * as Phaser from 'phaser';
import { ASSET_KEYS } from "./assets"

export const DIRECTION = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
}

export const INTERACTIVE_OBJECT_TYPE = {
    AUTO: 'AUTO',
    PICKUP: 'PICKUP',
    OPEN: 'OPEN',
    DIALOG: 'DIALOG',
    MINI_GAME: 'MINI_GAME',
}

export const LEVEL_NAME = {

}

export const DEFAULT_UI_TEXT_STYLE = {
    align: 'center',
    fontFamily: ASSET_KEYS.FONT_PRESS_START_2P,
    fontSize: 8,
    wordWrap: { width: 170 },
    color: '#FFFFFF',
}