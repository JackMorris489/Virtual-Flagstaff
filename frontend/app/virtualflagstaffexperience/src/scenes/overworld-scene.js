import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { Player } from '../game-objects/player/player';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { Spider } from '../game-objects/npcs/spider';
import { CharacterGameObject } from '../game-objects/common/character-game-object';
import { InteractiveNPC } from '../game-objects/npcs/interactable-npc';
import { PlayerContainer } from '../game-objects/player/player-container';
import { PlayerInteractionZone } from '../game-objects/player/player-interaction-zone';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';
import { NPC_DIALOG } from '../common/npc-dialog';
import { TILED_LAYER_NAMES, TILED_TILESET_NAMES } from '../common/tiled/common';
import apiFetch from '../../../utils/apiFetch';


/** 
    The overworld game scene, where players move across the Flagstaff map and can interact with NPCs and Objects.
    This scene holds the Flagstaff map data, the player, NPCs, and Minigame interactables and handles the
    interactions between all of these.
**/
export class Overworld extends Phaser.Scene {
    controls;
    #playerContainer;
    player;
    #playerInteractionZone;
    playerIcon;
    playerType;
    #interactiveNPCGroup;
    #interactiveSpider;
    mayorIcon;
    #interactiveSkier;
    #interactiveSnowboarder;
    currentDialogNumber = 0;
    #allCollisionLayer;
    minigameinteractables;
    snowboardInteractable
    skiInteractable
    interactablesIcons;
    skiInteractableIcon;
    snowboardInteractableIcon;
    skiEndlessMode = false;
    overlayImage;
    miniMapCamera;
    #npcIconGroup

    constructor() {
        super({
            key: SCENE_KEYS.GAME_SCENE,
        });
    }

    async create() {
        /* ========== MAP ========== */
        // TODO: ADD MIDDLEGROUND FOR DETAILED ITEMS
        // load in the tilemap data
        const map = this.make.tilemap({
            key: ASSET_KEYS.FLAGSTAFF_LEVEL,
        });

        // LOG TILEMAP DATA
        console.log("Map Orientation: ", map.orientation);
        console.log("Map Height", map.height, map.heightInPixels);
        console.log("Map Width", map.width, map.widthInPixels);
        console.log("Map Layers: ", map.layers);
        console.log("TILESET DATA\nMap Tilesets: ", map.tilesets);
        console.log("Tile Height: ", map.tileHeight);
        console.log("Tile Width: ", map.tileWidth);

        // create the tilesets
        const bricks = map.addTilesetImage(TILED_TILESET_NAMES.BRICKS, ASSET_KEYS.BRICKS);
        const street = map.addTilesetImage(TILED_TILESET_NAMES.STREET, ASSET_KEYS.STREET);
        const streets = map.addTilesetImage(TILED_TILESET_NAMES.STREETS, ASSET_KEYS.STREETS);
        const roofs = map.addTilesetImage(TILED_TILESET_NAMES.ROOFS, ASSET_KEYS.ROOFS);
        const equipment = map.addTilesetImage(TILED_TILESET_NAMES.EQUIPMENT, ASSET_KEYS.EQUIPMENT);
        const victorianStreet = map.addTilesetImage(TILED_TILESET_NAMES.VICTORASTREET, ASSET_KEYS.VICTORASTREET);
        const victorianTenement = map.addTilesetImage(TILED_TILESET_NAMES.VICTORATENEMENT, ASSET_KEYS.VICTORATENEMENT);
        const collisionTiles = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);

        // create the map layers
        const groundLayer = map.createLayer(TILED_LAYER_NAMES.GROUND_LAYER, [bricks, street, streets], 0, 0);
        const groundLayer2 = map.createLayer(TILED_LAYER_NAMES.GROUND_LAYER_2, [equipment], 1024, 0);
        const buildings1 = map.createLayer(TILED_LAYER_NAMES.BUILDINGS_1, [bricks, roofs, victorianStreet, victorianTenement], 512, 0).setDepth(1);
        const buildings2 = map.createLayer(TILED_LAYER_NAMES.BUILDINGS_2, [bricks, roofs, victorianStreet, victorianTenement], 512, 0).setDepth(2);
        const buildings3 = map.createLayer(TILED_LAYER_NAMES.BUILDINGS_3, [bricks, roofs, victorianStreet, victorianTenement], 512, 0).setDepth(3);
        const buildings4 = map.createLayer(TILED_LAYER_NAMES.BUILDINGS_4, [bricks, roofs, victorianStreet, victorianTenement], 1024, 1024).setDepth(4);

        // create collision map
        this.#allCollisionLayer = map.createLayer(TILED_LAYER_NAMES.ALL_COLLISION, [collisionTiles], 0, 0);
        this.#allCollisionLayer.setDepth(2).setAlpha(0);

        /* ========== CONTROLS ========== */
        // check if keyboard is avalible then create controls
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.controls = new KeyboardComponent(this.input.keyboard);

        const spawnPoint = {x: groundLayer.width/2 + 300, y: groundLayer.height/2 + 600}

        /* ========== PLAYER ========== */
        // create the player container to hold the player and interaction zone
        this.player = new Player({
            scene: this,
            position: {x: spawnPoint.x, y: spawnPoint.y},
            controls: this.controls,
        });
        this.#playerInteractionZone = new PlayerInteractionZone({
            scene: this,
            position: {x: 0, y: 0},
        });
        this.#playerContainer = new PlayerContainer({
            scene: this,
            x: 0, 
            y: 0,
            children: [this.player, this.#playerInteractionZone],
        });
        this.playerIcon = this.add.circle(this.player.x, this.player.y, 20, 0xFF0000, 1);

        /* ========== Cameras ========== */
        // lock the camera to the player
        this.cameras.main.setName('main')
        this.cameras.main.startFollow(this.player);

        // camera hue shifting based on weather WIP
        // TODO: REFINE/REMAKE THIS FUNCTION
        this.overlayImage = this.add.rectangle(
            this.cameras.main.width/2, 
            this.cameras.main.height/2, 
            this.cameras.main.width, 
            this.cameras.main.height, 
            0x000000, 
            0.1
        ).setDepth(10000);
        this.overlayImage.setScrollFactor(0);

        // Minimap
        // TODO: REFINE
        this.miniMapCamera = this.cameras.add(
            this.scale.width - this.scale.width/5 - 10, 
            10, 
            this.scale.width/5, 
            this.scale.height/5, 
            false, 
            'minimap'
        ).setZoom(0.1);
        this.miniMapCamera.ignore(this.#playerContainer);
        this.miniMapCamera.ignore(this.overlayImage);
        this.miniMapCamera.ignore(groundLayer2);

        /* ========== NPCs ========== */
        const npcs = await apiFetch("/npcs");

        let npcGroup = [];
        let npcIconGroup = [];
        for (const npc of npcs) {

            const npcQuests = await apiFetch(`/npcs/${npc.id}/quests`);

            const questId = npcQuests.id;
            const npcPos = {
                x: spawnPoint.x + npc.x_pos, 
                y: spawnPoint.y + npc.y_pos
            }
            const npcObject = new InteractiveNPC(
                {
                    scene: this,
                    position: {
                        x: npcPos.x,
                        y: npcPos.y
                    },
                    id: npc.id,
                    interactionType: "DIALOG",
                },
                npc.name,
                questId
            );

            npcGroup.push(npcObject);
            npcIconGroup.push(this.add.circle(npcPos.x, npcPos.y, 20, 0xFFFF00, 1));
        }

        // create the interactable npc group
        this.#interactiveNPCGroup = this.add.group(npcGroup, {runChildUpdate: true})

       // create the icon group
       this.#npcIconGroup = this.add.graphics(npcIconGroup)
        // this.#npcIconGroup = this.add.group([
        //     this.mayorIcon = this.add.circle(this.#interactiveSpider.x, this.#interactiveSpider.y, 20, 0xFFFF00, 1)
        // ]);

        /* ========== INTERACTABLES ========== */
        // TODO: Rework how the snowboard and ski interactable objects work
        // snowboard interactables to start the ski/snowboard minigame
        this.minigameinteractables = this.add.group([
            this.skiInteractable = new Phaser.Physics.Arcade.Image(this, 1184, 496, ''),
            this.snowboardInteractable = new Phaser.Physics.Arcade.Image(this, 1056, 496, ''),
        ])

        this.physics.add.existing(this.snowboardInteractable);
        this.physics.add.existing(this.skiInteractable);

        this.snowboardInteractable.body.setSize(64, 32, true);
        this.skiInteractable.body.setSize(64, 32, true);

        this.physics.add.overlap(this.#playerInteractionZone, this.snowboardInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('SNOWBOARDER');
            }
        }, null, this);

        this.physics.add.overlap(this.#playerInteractionZone, this.skiInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('SKIIER');
            }
        }, null, this);


        // create the icon group
        this.interactablesIcons = this.add.group([
            this.snowboardInteractableIcon = this.add.circle(this.snowboardInteractable.x, this.snowboardInteractable.y, 20, 0xFF00FF, 1),
            this.skiInteractableIcon = this.add.circle(this.skiInteractable.x, this.skiInteractable.y, 20, 0xFF00FF, 1),
        ]);

        /* ========== REGISTERS ========== */
        // register the events and colliders
        this.#registerColiders();
        this.#registerCustomEvents();

        // register the UI Scene with this game scene
        this.scene.launch(SCENE_KEYS.UI_SCENE);


        this.cameras.main.ignore(this.playerIcon);
        for (const npcIcon of npcIconGroup)
        {
            this.cameras.main.ignore(npcIcon)
        }
        this.cameras.main.ignore(this.mayorIcon);
        this.cameras.main.ignore(this.interactablesIcons);
    };

    update() {
        this.#playerContainer.moveInteractZone();
        this.#minimapTracking();
    }

    #minigameInteraction(playerType) {
        this.playerType = playerType;
        this.scene.switch(this.scene.get(SCENE_KEYS.SKI_GAME));
        this.scene.get(SCENE_KEYS.SKI_GAME).scene.restart();
    }

    #minimapTracking() {
        this.miniMapCamera.scrollX = Phaser.Math.Clamp(this.player.physicsBody.x, 880, 1484);
        this.miniMapCamera.scrollY = Phaser.Math.Clamp(this.player.physicsBody.y, 412, 1312);
        this.playerIcon.setPosition(this.player.physicsBody.x, this.player.physicsBody.y);
    }

    #collideObjects() {
        this.player.setVelocityX(0);
        this.player.setVelocityY(0);
    }

    #registerColiders() {

        // interactive npc group colliders
        this.#interactiveNPCGroup.getChildren().forEach((npc) => {
            npc.setCollideWorldBounds(false);
            this.physics.add.collider(this.player, npc, this.#collideObjects, null, this);
            this.physics.add.collider(this.#allCollisionLayer, npc);
            this.physics.add.overlap(this.#playerInteractionZone, npc, () => {
                if(this.controls.isActionJustDown) {
                    this.player.interactedWithGameObject(npc);
                    this.player.interact();
                }
            }, null, this);
        });

        // world colliders
        this.#allCollisionLayer.setCollision([this.#allCollisionLayer.tileset[0].firstgid]);
        this.physics.add.collider(this.player, this.#allCollisionLayer);
    }

    #registerCustomEvents() {
        return;
    }
}