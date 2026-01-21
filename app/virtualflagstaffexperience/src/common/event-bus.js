import * as Phaser from 'phaser';

export const EVENT_BUS = new Phaser.Events.EventEmitter();

export const CUSTOM_EVENTS = {
    SHOW_DIALOG: 'SHOW_DIALOG',
    CLOSE_DIALOG: 'CLOSE_DIALOG',
}