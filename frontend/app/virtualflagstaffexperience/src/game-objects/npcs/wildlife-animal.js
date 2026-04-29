import * as Phaser from 'phaser'
import { CharacterGameObject } from '../common/character-game-object';
import { ASSET_KEYS } from '../../common/assets';
import { DIRECTION } from '../../common/common';
import { ANIMAL_SPEED } from '../../common/config';

/**
    
**/ 
export class WildLifeAnimal extends CharacterGameObject {
    constructor(config){
        super({
            scene: config.scene,
            position: config.position,
            assetKey: config.assetKey,
            frame: 0,
            id: `animal-${Phaser.Math.RND.uuid()}`,
            isPlayer: false,
            speed: ANIMAL_SPEED,
        })
    }
}