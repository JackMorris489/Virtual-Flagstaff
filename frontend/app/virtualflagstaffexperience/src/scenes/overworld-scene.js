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
    #interactiveSkier;
    #interactiveSnowboarder;
    currentDialogNumber = 0;
    #allCollisionLayer;
    minigameinteractables;
    snowboardInteractable;
    skiInteractable;
    hmvInteractable;
    dinerInteractable;
    wildlifeInteractable;
    interactablesIcons;
    skiInteractableIcon;
    snowboardInteractableIcon;
    dinerInteractableIcon;
    monteVistaInteractableIcon;
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
        const equipment = map.addTilesetImage(TILED_TILESET_NAMES.EQUIPMENT, ASSET_KEYS.EQUIPMENT);
        const flasgtaffStreet = map.addTilesetImage(TILED_TILESET_NAMES.STREETS, ASSET_KEYS.STREETS);
        const roofs = map.addTilesetImage(TILED_TILESET_NAMES.ROOFS, ASSET_KEYS.ROOFS);
        const terrain = map.addTilesetImage(TILED_TILESET_NAMES.TERRAIN, ASSET_KEYS.TERRAIN)
        const victorianStreet = map.addTilesetImage(TILED_TILESET_NAMES.VICTORIAN_STREET, ASSET_KEYS.VICTORIAN_STREET);
        const victorianTenement = map.addTilesetImage(TILED_TILESET_NAMES.VICTORIAN_TENEMENT, ASSET_KEYS.VICTORIAN_TENEMENT);
        const victorianExtras = map.addTilesetImage(TILED_TILESET_NAMES.VICTORIAN_EXTRAS, ASSET_KEYS.VICTORIAN_EXTRAS);
        const collision = map.addTilesetImage(TILED_TILESET_NAMES.COLLISION, ASSET_KEYS.COLLISION);

        // create the map layers
        const groundLow = map.createLayer(TILED_LAYER_NAMES.GROUND_LOW, [bricks, flasgtaffStreet, terrain], 0, 0).setDepth(0);
        const groundHigh = map.createLayer(TILED_LAYER_NAMES.GROUND_HIGH, [bricks, flasgtaffStreet, terrain], 0, 0).setDepth(1);
        const mapExtras = map.createLayer(TILED_LAYER_NAMES.MAP_EXTRAS, [victorianStreet], 0, 0).setDepth(2);
        const buildingsBase = map.createLayer(TILED_LAYER_NAMES.BUILDING_BASE, [victorianTenement, roofs], 0, 0).setDepth(3);
        const buildingsGrate = map.createLayer(TILED_LAYER_NAMES.BUILDING_GRATE, [roofs], 0, 0).setDepth(4);
        const buildingsFrontEave = map.createLayer(TILED_LAYER_NAMES.BUILDING_FRONT_EAVE, [roofs, victorianTenement], 0, 0).setDepth(5);
        const buildingsSideEave = map.createLayer(TILED_LAYER_NAMES.BUILDING_SIDE_EAVE, [roofs], 0, 0).setDepth(6);
        const buildingsEaveOverlap = map.createLayer(TILED_LAYER_NAMES.BUILDING_EAVE_OVERLAP, [roofs], 0, 0).setDepth(7);
        const buildingsExtra = map.createLayer(TILED_LAYER_NAMES.BUILDING_EXTRAS, [victorianTenement, victorianStreet], 0, 0).setDepth(8);
        const buildingsDoorWindows = map.createLayer(TILED_LAYER_NAMES.BUILDING_DOORS_WINDOWS, [victorianExtras], 0, 0).setDepth(9);

        // create collision map
        this.#allCollisionLayer = map.createLayer(TILED_LAYER_NAMES.COLLISION, [collision], 0, 0);
        this.#allCollisionLayer.setDepth(0).setAlpha(0);

        //
        const skiInteractable = map.createLayer(TILED_LAYER_NAMES.SKI_INTERACTABLES, [equipment], 0, 0).setDepth(10);
        const snowboardInteractable = map.createLayer(TILED_LAYER_NAMES.SNOWBOARD_INTERACTABLES, [equipment], 0, 0).setDepth(10);
        const hmvInteractable = map.createLayer(TILED_LAYER_NAMES.HMV_INTERACTABLES, [equipment], 0, 0).setDepth(10);
        const dinerInteractable = map.createLayer(TILED_LAYER_NAMES.DINER_INTERACTABLES, [equipment], 0, 0).setDepth(10);
        const wildlifeInteractable = map.createLayer(TILED_LAYER_NAMES.WILDLIFE_INTERACTABLES, [equipment], 0, 0).setDepth(10);

        /* ========== CONTROLS ========== */
        // check if keyboard is avalible then create controls
        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.controls = new KeyboardComponent(this.input.keyboard);

        /* ========== PLAYER ========== */
        // create the player container to hold the player and interaction zone
        const spawnPoint = {x: map.widthInPixels-(91*32), y: map.heightInPixels-(22*32)}
        
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
        }).setDepth(4);
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
        this.miniMapCamera = this.cameras.add(
            this.scale.width - this.scale.width/5 - 10, 
            10, 
            this.scale.width/5, 
            this.scale.height/5, 
            false, 
            'minimap'
        ).setZoom(0.05);
        this.miniMapCamera.ignore(this.#playerContainer);
        this.miniMapCamera.ignore(this.overlayImage);
        this.miniMapCamera.ignore(groundHigh);

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
                questId,
                npc.key
            );

            npcGroup.push(npcObject);
            npcIconGroup.push(this.add.circle(npcPos.x, npcPos.y, 20, 0xFFFF00, 1));
        }

        // create the interactable npc group
        this.#interactiveNPCGroup = this.add.group(npcGroup, {runChildUpdate: true})

       // create the icon group
        this.#npcIconGroup = this.add.graphics(npcIconGroup)

        /* ========== INTERACTABLES ========== */
        this.#ensureFallbackTextures();

        // TODO: Rework how the snowboard and ski interactable objects work
        // snowboard interactables to start the ski/snowboard minigame
        this.minigameinteractables = this.add.group([
            this.skiInteractable = new Phaser.Physics.Arcade.Image(this, 4384+32, 512+16, ''), 
            this.snowboardInteractable = new Phaser.Physics.Arcade.Image(this, 4512+32, 512+16, ''), 
            this.hmvInteractable = new Phaser.Physics.Arcade.Image(this, 4096+16, 1792+16, ''), 
            this.dinerInteractable = new Phaser.Physics.Arcade.Image(this, 2944+32, 1888+8, ''), 
            this.wildlifeInteractable = new Phaser.Physics.Arcade.Image(this, 2528, 5168, ''), 
        ]).setDepth(10);

        this.physics.add.existing(this.skiInteractable);
        this.physics.add.existing(this.snowboardInteractable);
        this.physics.add.existing(this.hmvInteractable);
        this.physics.add.existing(this.dinerInteractable);
        this.physics.add.existing(this.wildlifeInteractable);

        this.skiInteractable.body.setSize(64, 32, true);
        this.snowboardInteractable.body.setSize(64, 32, true);
        this.hmvInteractable.body.setSize(32, 32, true);
        this.dinerInteractable.body.setSize(64, 64, true);
        this.wildlifeInteractable.body.setSize(64, 32, true);

        this.physics.add.overlap(this.#playerInteractionZone, this.skiInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('SKIIER');
            }
        }, null, this);

        this.physics.add.overlap(this.#playerInteractionZone, this.snowboardInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('SNOWBOARDER');
            }
        }, null, this);

        this.physics.add.overlap(this.#playerInteractionZone, this.hmvInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('HMV');
            }
        }, null, this);

        this.physics.add.overlap(this.#playerInteractionZone, this.dinerInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('DINER');
            }
        }, null, this);

        this.physics.add.overlap(this.#playerInteractionZone, this.wildlifeInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('WILDLIFE');
            }
        }, null, this);

        this.physics.add.overlap(this.#playerInteractionZone, this.dinerInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('DINER', SCENE_KEYS.DINER_GAME);
            }
        }, null, this);

        this.physics.add.overlap(this.#playerInteractionZone, this.hmvInteractable, () => {
            if(this.controls.isActionJustDown) {
                this.#minigameInteraction('MONTEVISTA', SCENE_KEYS.MONTE_VISTA_GAME);
            }
        }, null, this);


        // create the icon group
        this.interactablesIcons = this.add.group([
            this.snowboardInteractableIcon = this.add.circle(this.snowboardInteractable.x, this.snowboardInteractable.y, 20, 0xFF00FF, 1),
            this.skiInteractableIcon = this.add.circle(this.skiInteractable.x, this.skiInteractable.y, 20, 0xFF00FF, 1),
            this.dinerInteractableIcon = this.add.circle(this.dinerInteractable.x, this.dinerInteractable.y, 20, 0x4ecdc4, 1),
            this.monteVistaInteractableIcon = this.add.circle(this.hmvInteractable.x, this.hmvInteractable.y, 20, 0xFF00FF, 1),
        ]);

        /* ========== REGISTERS ========== */
        // register the events and colliders
        this.#registerColiders();
        this.#registerCustomEvents();

        // register the UI Scene with this game scene
        this.scene.launch(
            SCENE_KEYS.UI_SCENE,
            {
                playerContainer: this.#playerContainer
            } 
        );

        this.physics.add.overlap(
            this.#playerInteractionZone,
            this.#interactiveNPCGroup,
            this.handlePlayerInRangeOfNpc,
            null,
            this
        )

        this.cameras.main.ignore(this.playerIcon);
        for (const npcIcon of npcIconGroup)
        {
            this.cameras.main.ignore(npcIcon)
        }
        this.cameras.main.ignore(this.interactablesIcons);
    };


    handlePlayerInRangeOfNpc()
    {
        EVENT_BUS.emit("PLAYER_IN_RANGE_OF_NPC");
    }


    update() {
        this.#playerContainer.moveInteractZone();
        this.#minimapTracking();
    }

    #minigameInteraction(gameType) {
        switch(gameType) {
            case 'SKIIER':
                this.playerType = gameType;
                this.scene.switch(this.scene.get(SCENE_KEYS.SKI_GAME));
                this.scene.get(SCENE_KEYS.SKI_GAME).scene.restart();
                break;

            case 'SNOWBOARDER':
                this.playerType = gameType;
                this.scene.switch(this.scene.get(SCENE_KEYS.SKI_GAME));
                this.scene.get(SCENE_KEYS.SKI_GAME).scene.restart();
                break;

            case 'HMV':
                this.scene.switch(this.scene.get(SCENE_KEYS.SKI_GAME));
                this.scene.get(SCENE_KEYS.SKI_GAME).scene.restart();
                break;

            case 'DINER':
                this.scene.switch(this.scene.get(SCENE_KEYS.SKI_GAME));
                this.scene.get(SCENE_KEYS.SKI_GAME).scene.restart();
                break;

            case 'WILDLIFE':
                this.scene.switch(this.scene.get(SCENE_KEYS.WILDLIFE_GAME));
                this.scene.get(SCENE_KEYS.WILDLIFE_GAME).scene.restart();
                break;
        }
    }

    #minimapTracking() {
        this.miniMapCamera.scrollX = Phaser.Math.Clamp(this.player.physicsBody.x, 0, 10000);
        this.miniMapCamera.scrollY = Phaser.Math.Clamp(this.player.physicsBody.y, 0, 10000);
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

    #ensureFallbackTextures() {
        if (this.textures.exists(ASSET_KEYS.DINER_ACCESS_BOX)) return;

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        graphics.fillStyle(0x4a241e, 1);
        graphics.fillRoundedRect(0, 0, 48, 48, 6);
        graphics.lineStyle(3, 0xffcf4f, 1);
        graphics.strokeRoundedRect(2, 2, 44, 44, 6);
        graphics.fillStyle(0xf6d28a, 1);
        graphics.fillRoundedRect(10, 18, 28, 16, 4);
        graphics.fillStyle(0x74381f, 1);
        graphics.fillRect(13, 23, 22, 5);
        graphics.fillStyle(0xe94535, 1);
        graphics.fillCircle(18, 25, 3);
        graphics.fillStyle(0x71c96a, 1);
        graphics.fillCircle(30, 25, 3);
        graphics.generateTexture(ASSET_KEYS.DINER_ACCESS_BOX, 48, 48);
        graphics.destroy();
    }
}
