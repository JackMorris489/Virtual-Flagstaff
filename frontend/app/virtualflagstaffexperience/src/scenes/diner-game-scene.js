import * as Phaser from 'phaser';
import { SCENE_KEYS } from './scene-keys';
import { ASSET_KEYS } from '../common/assets';
import { KeyboardComponent } from '../components/input/keyboard-component';
import { GameScene } from './game-scene';
import apiFetch from '../../../utils/apiFetch';
import { CUSTOM_EVENTS, EVENT_BUS } from '../common/event-bus';

const WAITER_SPEED = 210;
const ORDER_POINTS = 5;
const CUSTOMER_ENTRANCE = { x: 500, y: 452 };
const MAX_ACTIVE_CUSTOMERS = 4;
const FOOD_ITEMS = [
    { id: 'burger', name: 'Burger', assetKey: ASSET_KEYS.DINER_BURGER },
    { id: 'coffee', name: 'Coffee', assetKey: ASSET_KEYS.DINER_COFFEE },
    { id: 'fries', name: 'Fries', assetKey: ASSET_KEYS.DINER_FRIES },
];
const CUSTOMER_ASSET_KEYS = [
    ASSET_KEYS.DINER_CUSTOMER_1,
    ASSET_KEYS.DINER_CUSTOMER_2,
    ASSET_KEYS.DINER_CUSTOMER_3,
    ASSET_KEYS.DINER_CUSTOMER_4,
];
const FOOD_STATIONS = [
    { itemId: 'burger', x: 78, y: 150 },
    { itemId: 'coffee', x: 78, y: 238 },
    { itemId: 'fries', x: 78, y: 326 },
];
const TABLES = [
    { x: 226, y: 202, customerX: 226, customerY: 148 },
    { x: 344, y: 202, customerX: 344, customerY: 148 },
    { x: 462, y: 202, customerX: 462, customerY: 148 },
    { x: 226, y: 358, customerX: 226, customerY: 304 },
    { x: 344, y: 358, customerX: 344, customerY: 304 },
    { x: 462, y: 358, customerX: 462, customerY: 304 },
];

export class DinerGame extends GameScene {
    #controls;
    uiScene;
    player;
    stations = [];
    tables = [];
    activeCustomers = [];
    carriedItem = null;
    carryIcon;
    scoreText;
    waveText;
    ordersText;
    isStartScreen = true;
    hasEnded = false;
    wave = 1;
    completedOrdersThisWave = 0;
    spawnedCustomersThisWave = 0;
    waveOrdersRequired = 0;
    nextCustomerId = 1;

    constructor() {
        super({
            sceneKey: SCENE_KEYS.DINER_GAME,
            gameKey: 'DINER_GAME'
        });
    }

    async create() {
        this.scene.pause();
        this.resetScore();
        this.isStartScreen = true;
        this.hasEnded = false;
        this.wave = 1;
        this.completedOrdersThisWave = 0;
        this.spawnedCustomersThisWave = 0;
        this.waveOrdersRequired = this.#getWaveOrdersRequired();
        this.nextCustomerId = 1;
        this.activeCustomers = [];
        this.carriedItem = null;

        this.#ensureFallbackTextures();
        this.#createDinerRoom();

        if (!this.input.keyboard) {
            console.warn('Phaser keyboard plugin is not setup properly');
            return;
        }
        this.#controls = new KeyboardComponent(this.input.keyboard);

        this.#createPlayer();
        this.#createStations();
        this.#createTables();
        this.#createHud();

        this.uiScene = this.scene.get(SCENE_KEYS.UI_SCENE);
        this.uiScene.showDialog(await this.buildStartDialogText());
    }

    update(time, delta) {
        if (this.isStartScreen || this.hasEnded) return;

        this.#updatePlayerMovement();
        this.#updateCarryIcon();
        this.#updateCustomers(delta);
        this.#fillOpenTables();

        if (this.#controls.isActionJustDown) {
            this.#handleAction();
        }
    }

    onEnterPressed() {
        if (this.isStartScreen) {
            this.isStartScreen = false;
            this.scoreText.setVisible(true);
            this.waveText.setVisible(true);
            this.ordersText.setVisible(true);
            this.scene.resume();
            this.#startWave();
            return;
        }

        this.scene.restart();
    }

    async buildStartDialogText() {
        return (
            'DINER MINI GAME\n\n' +
            'Serve every item shown above each customer.\n' +
            'Each completed order is worth 5 points.\n\n' +
            'Waves add more customers, shorter timers,\n' +
            'and later waves include multi-item orders.\n\n' +
            'Press X at a station to pick up food.\n' +
            'Press X at a table to serve.\n\n' +
            'Press Enter to start\n' +
            'Press Escape to return to Flagstaff\n\n' +
            await this.getLeaderboardText()
        );
    }

    async buildEndDialogText(titleText) {
        return (
            `${titleText}\n` +
            `Score: ${this.score}\n` +
            `Wave: ${this.wave}\n\n` +
            'Press Enter to play again\n' +
            'Press Escape to return to Flagstaff\n\n' +
            await this.getLeaderboardText()
        );
    }

    async getLeaderboard() {
        return await apiFetch(`/game-sessions/${this.gameKey}/leaderboard`, {
            cache: 'no-store',
        });
    }

    async getLeaderboardText() {
        try {
            const leaderboard = await this.getLeaderboard();

            if (leaderboard.length === 0) {
                return 'Leaderboard:\nNo scores yet';
            }

            let text = 'Leaderboard:\n';
            leaderboard.forEach((entry, index) => {
                text += `${index + 1}. ${entry.username}: ${entry.score}\n`;
            });
            return text.trimEnd();
        } catch {
            return 'Leaderboard:\nUnavailable';
        }
    }

    #createDinerRoom() {
        this.add.tileSprite(256, 232, 512, 464, ASSET_KEYS.DINER_FLOOR_TILE);

        const graphics = this.add.graphics();
        graphics.fillStyle(0x5a2e26, 1);
        graphics.fillRect(0, 0, 512, 82);
        graphics.fillStyle(0xf0d18c, 1);
        graphics.fillRect(0, 78, 512, 4);
        graphics.fillStyle(0x2b1b18, 1);
        graphics.fillRect(0, 0, 128, 464);
        graphics.fillStyle(0x8f4d36, 1);
        graphics.fillRect(126, 0, 4, 464);
        graphics.fillStyle(0x3d2520, 1);
        graphics.fillRect(18, 92, 88, 326);
        graphics.lineStyle(2, 0xf6c56a, 1);
        graphics.strokeRect(18, 92, 88, 326);
    }

    #createPlayer() {
        this.player = this.physics.add.sprite(206, 414, ASSET_KEYS.DINER_WAITER);
        this.player.setDepth(30);
        this.player.setCollideWorldBounds(true);

        if (this.player.body) {
            this.player.body.setSize(20, 28, true);
        }

        this.carryIcon = this.add.image(this.player.x, this.player.y - 36, ASSET_KEYS.DINER_BURGER)
            .setScale(0.9)
            .setDepth(35)
            .setVisible(false);
    }

    #createStations() {
        this.stations = FOOD_STATIONS.map((station) => {
            const item = this.#getFoodItem(station.itemId);

            const stationSprite = this.add.image(station.x, station.y, ASSET_KEYS.DINER_FOOD_STATION)
                .setDepth(10);
            const foodIcon = this.add.image(station.x, station.y - 8, item.assetKey)
                .setScale(0.85)
                .setDepth(11);
            const label = this.add.text(station.x, station.y + 32, item.name, {
                fontFamily: ASSET_KEYS.FONT_PRESS_START_2P,
                fontSize: '7px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5).setDepth(12);

            return {
                ...station,
                item,
                sprite: stationSprite,
                icon: foodIcon,
                label,
            };
        });
    }

    #createTables() {
        this.tables = TABLES.map((table) => {
            const tableSprite = this.add.image(table.x, table.y, ASSET_KEYS.DINER_TABLE)
                .setDepth(8);
            return {
                ...table,
                sprite: tableSprite,
            };
        });
    }

    #createHud() {
        this.scoreText = this.add.text(16, 19, 'Score: 0', {
            fontSize: '16px',
            color: '#ffd166',
            stroke: '#000000',
            strokeThickness: 4,
        }).setScrollFactor(0).setDepth(100).setVisible(false);

        this.waveText = this.add.text(256, 14, 'Wave: 1', {
            fontSize: '15px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(100).setVisible(false);

        this.ordersText = this.add.text(496, 14, 'Orders: 0/0', {
            fontSize: '13px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(1, 0).setScrollFactor(0).setDepth(100).setVisible(false);
    }

    #startWave() {
        this.completedOrdersThisWave = 0;
        this.spawnedCustomersThisWave = 0;
        this.waveOrdersRequired = this.#getWaveOrdersRequired();
        this.#updateHud();
        this.#fillOpenTables();
    }

    #completeWaveIfNeeded() {
        if (
            this.completedOrdersThisWave < this.waveOrdersRequired ||
            this.activeCustomers.length > 0
        ) {
            return;
        }

        this.wave += 1;
        this.time.delayedCall(850, () => {
            if (!this.hasEnded) {
                this.#startWave();
            }
        });
    }

    #fillOpenTables() {
        while (
            !this.hasEnded &&
            this.activeCustomers.length < this.#getMaxActiveCustomers() &&
            this.spawnedCustomersThisWave < this.waveOrdersRequired
        ) {
            const table = this.#getOpenTable();
            if (!table) return;
            this.#spawnCustomer(table);
        }
    }

    #spawnCustomer(table) {
        const orderItems = this.#buildOrderItems();
        const maxPatience = this.#getCustomerPatience(orderItems.length);
        const customerAssetKey = CUSTOMER_ASSET_KEYS[(this.nextCustomerId - 1) % CUSTOMER_ASSET_KEYS.length];
        const customer = this.physics.add.image(CUSTOMER_ENTRANCE.x, CUSTOMER_ENTRANCE.y, customerAssetKey)
            .setDepth(20);
        const customerData = {
            id: this.nextCustomerId,
            sprite: customer,
            orderItems,
            table,
            seated: false,
            maxPatience,
            patience: maxPatience,
            orderIcons: [],
            timerBg: this.add.rectangle(customer.x, customer.y - 22, 44, 6, 0x241816, 1)
                .setDepth(33),
            timerBar: this.add.rectangle(customer.x, customer.y - 22, 44, 6, 0x44d17a, 1)
                .setOrigin(0, 0.5)
                .setDepth(34),
            timerText: this.add.text(customer.x, customer.y - 36, '', {
                fontFamily: ASSET_KEYS.FONT_PRESS_START_2P,
                fontSize: '7px',
                color: '#ffffff',
                stroke: '#000000',
                strokeThickness: 3,
            }).setOrigin(0.5).setDepth(35),
        };

        this.nextCustomerId += 1;
        this.spawnedCustomersThisWave += 1;
        this.activeCustomers.push(customerData);
        this.#rebuildOrderIcons(customerData);
        this.#updateCustomerUi(customerData);
        this.#updateHud();

        this.tweens.add({
            targets: customer,
            x: table.customerX,
            y: table.customerY,
            duration: 1200,
            ease: 'Sine.easeInOut',
            onUpdate: () => this.#updateCustomerUi(customerData),
            onComplete: () => {
                if (!this.hasEnded && this.activeCustomers.includes(customerData)) {
                    customerData.seated = true;
                    this.#updateCustomerUi(customerData);
                }
            },
        });
    }

    #handleAction() {
        const station = this.#getNearbyStation();
        if (station) {
            this.#pickUpItem(station.item);
            return;
        }

        const customer = this.#getNearbyCustomer();
        if (customer) {
            this.#deliverOrderItem(customer);
        }
    }

    #pickUpItem(item) {
        this.carriedItem = item;
        this.carryIcon.setTexture(item.assetKey);
        this.carryIcon.setVisible(true);
    }

    #deliverOrderItem(customer) {
        if (!this.carriedItem) {
            this.#endGame('GAME OVER\nNo food served!');
            return;
        }

        const matchingItemIndex = customer.orderItems.findIndex((item) => item.id === this.carriedItem.id);
        if (matchingItemIndex === -1) {
            this.#endGame(`GAME OVER\nWrong item!\nWanted ${this.#formatOrder(customer.orderItems)}`);
            return;
        }

        customer.orderItems.splice(matchingItemIndex, 1);
        this.carriedItem = null;
        this.carryIcon.setVisible(false);
        this.#rebuildOrderIcons(customer);
        this.#updateCustomerUi(customer);

        if (customer.orderItems.length === 0) {
            this.#completeCustomerOrder(customer);
        }
    }

    #completeCustomerOrder(customer) {
        this.addScore(ORDER_POINTS);
        this.completedOrdersThisWave += 1;
        this.#clearCustomer(customer);
        this.#updateHud();
        this.#fillOpenTables();
        this.#completeWaveIfNeeded();
    }

    async #endGame(titleText) {
        if (this.hasEnded) return;

        this.hasEnded = true;
        this.scene.pause();
        this.#clearAllCustomers();

        await this.submitGameSession();
        await this.#awardPlayerPoints();

        if (this.wave >= 3)
        {
            await apiFetch(`/users/me/quests/3`, {
                method: "PATCH",
                credentials: "include",
            });
            EVENT_BUS.emit(CUSTOM_EVENTS.REFRESH_QUESTS)
        }

        this.uiScene.showDialog(await this.buildEndDialogText(titleText));
    }

    async #awardPlayerPoints() {
        try {
            await apiFetch(
                '/users/me',
                {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        points: Number(this.score)
                    })
                }
            );
        } catch {
            return;
        }
    }

    #clearCustomer(customer) {
        this.tweens.killTweensOf(customer.sprite);
        customer.sprite.destroy();
        customer.orderIcons.forEach((icon) => icon.destroy());
        customer.timerBg.destroy();
        customer.timerBar.destroy();
        customer.timerText.destroy();
        this.activeCustomers = this.activeCustomers.filter((activeCustomer) => activeCustomer !== customer);
    }

    #clearAllCustomers() {
        [...this.activeCustomers].forEach((customer) => this.#clearCustomer(customer));
    }

    #updatePlayerMovement() {
        if (!this.player?.body) return;

        const velocity = new Phaser.Math.Vector2(0, 0);

        if (this.#controls.isLeftDown) velocity.x -= 1;
        if (this.#controls.isRightDown) velocity.x += 1;
        if (this.#controls.isUpDown) velocity.y -= 1;
        if (this.#controls.isDownDown) velocity.y += 1;

        if (velocity.length() > 0) {
            velocity.normalize().scale(WAITER_SPEED);
        }

        this.player.setVelocity(velocity.x, velocity.y);

        if (velocity.x < 0) {
            this.player.setFlipX(true);
        } else if (velocity.x > 0) {
            this.player.setFlipX(false);
        }
    }

    #updateCarryIcon() {
        if (!this.carryIcon.visible) return;
        this.carryIcon.setPosition(this.player.x, this.player.y - 38);
    }

    #updateCustomers(delta) {
        for (const customer of [...this.activeCustomers]) {
            if (this.hasEnded) return;

            this.#updateCustomerUi(customer);

            if (!customer.seated) continue;

            customer.patience -= delta;
            const ratio = Phaser.Math.Clamp(customer.patience / customer.maxPatience, 0, 1);
            customer.timerBar.setScale(ratio, 1);
            customer.timerBar.setFillStyle(ratio > 0.35 ? 0x44d17a : 0xff5f56, 1);
            customer.timerText.setText(`${Math.ceil(customer.patience / 1000)}s`);

            if (customer.patience <= 0) {
                this.#endGame('GAME OVER\nOrder took too long!');
            }
        }
    }

    #updateCustomerUi(customer) {
        const { sprite } = customer;
        const timerWidth = 44;

        customer.timerBg.setPosition(sprite.x, sprite.y - 22);
        customer.timerBar.setPosition(sprite.x - timerWidth / 2, sprite.y - 22);
        customer.timerText.setPosition(sprite.x, sprite.y - 36);
        customer.timerText.setText(`${Math.ceil(customer.patience / 1000)}s`);

        customer.orderIcons.forEach((icon, index) => {
            const offsetX = ((customer.orderIcons.length - 1) * -14) + (index * 28);
            icon.setPosition(sprite.x + offsetX, sprite.y - 54);
        });
    }

    #rebuildOrderIcons(customer) {
        customer.orderIcons.forEach((icon) => icon.destroy());
        customer.orderIcons = customer.orderItems.map((item) => (
            this.add.image(customer.sprite.x, customer.sprite.y - 54, item.assetKey)
                .setScale(0.72)
                .setDepth(36)
        ));
    }

    #updateHud() {
        if (!this.scoreText) return;

        this.scoreText.setText(`Score: ${this.score}`);
        this.waveText.setText(`Wave: ${this.wave}`);
        this.ordersText.setText(`Orders: ${this.completedOrdersThisWave}/${this.waveOrdersRequired}`);
    }

    #getNearbyStation() {
        return this.stations.find((station) => (
            Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                station.x,
                station.y
            ) <= 48
        ));
    }

    #getNearbyCustomer() {
        return this.activeCustomers.find((customer) => (
            customer.seated &&
            Phaser.Math.Distance.Between(
                this.player.x,
                this.player.y,
                customer.table.x,
                customer.table.y
            ) <= 58
        ));
    }

    #getOpenTable() {
        const openTables = this.tables.filter((table) => (
            !this.activeCustomers.some((customer) => customer.table === table)
        ));

        return Phaser.Utils.Array.GetRandom(openTables);
    }

    #getFoodItem(itemId) {
        return FOOD_ITEMS.find((item) => item.id === itemId);
    }

    #getWaveOrdersRequired() {
        return Math.min(12, 3 + this.wave);
    }

    #getMaxActiveCustomers() {
        return Phaser.Math.Clamp(1 + Math.floor((this.wave - 1) / 2), 1, MAX_ACTIVE_CUSTOMERS);
    }

    #getOrderSize() {
        if (this.wave < 5) return 1;
        if (this.wave < 8) return Phaser.Math.Between(1, 2);
        return Phaser.Math.Between(2, 3);
    }

    #getCustomerPatience(orderSize) {
        return Math.max(6500, 17500 - (this.wave * 950) - ((orderSize - 1) * 650));
    }

    #buildOrderItems() {
        return Array.from({ length: this.#getOrderSize() }, () => Phaser.Utils.Array.GetRandom(FOOD_ITEMS));
    }

    #formatOrder(orderItems) {
        return orderItems.map((item) => item.name).join(', ');
    }

    #ensureFallbackTextures() {
        this.#createTextureIfMissing(ASSET_KEYS.DINER_FLOOR_TILE, 32, 32, (graphics) => {
            graphics.fillStyle(0x6f4b3a, 1);
            graphics.fillRect(0, 0, 32, 32);
            graphics.fillStyle(0x785644, 1);
            graphics.fillRect(0, 0, 16, 16);
            graphics.fillRect(16, 16, 16, 16);
            graphics.lineStyle(1, 0x3a2922, 0.55);
            graphics.strokeRect(0, 0, 32, 32);
        });

        this.#createTextureIfMissing(ASSET_KEYS.DINER_FOOD_STATION, 76, 48, (graphics) => {
            graphics.fillStyle(0x4d3128, 1);
            graphics.fillRoundedRect(0, 8, 76, 34, 6);
            graphics.fillStyle(0xd7c19b, 1);
            graphics.fillRoundedRect(4, 4, 68, 20, 4);
            graphics.lineStyle(2, 0x221713, 1);
            graphics.strokeRoundedRect(0, 8, 76, 34, 6);
        });

        this.#createTextureIfMissing(ASSET_KEYS.DINER_TABLE, 72, 48, (graphics) => {
            graphics.fillStyle(0x3b211b, 1);
            graphics.fillRect(10, 8, 8, 34);
            graphics.fillRect(54, 8, 8, 34);
            graphics.fillStyle(0xa65f35, 1);
            graphics.fillRoundedRect(4, 4, 64, 38, 8);
            graphics.fillStyle(0xf7d79a, 1);
            graphics.fillRoundedRect(10, 10, 52, 26, 6);
            graphics.lineStyle(2, 0x2a1713, 1);
            graphics.strokeRoundedRect(4, 4, 64, 38, 8);
        });

        this.#createTextureIfMissing(ASSET_KEYS.DINER_WAITER, 28, 38, (graphics) => {
            graphics.fillStyle(0x2e1f1b, 1);
            graphics.fillCircle(14, 8, 7);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRoundedRect(8, 15, 12, 16, 3);
            graphics.fillStyle(0x111111, 1);
            graphics.fillTriangle(8, 15, 20, 15, 14, 24);
            graphics.fillStyle(0x2e1f1b, 1);
            graphics.fillRect(6, 31, 6, 7);
            graphics.fillRect(16, 31, 6, 7);
        });

        this.#createCustomerTextureIfMissing(ASSET_KEYS.DINER_CUSTOMER_1, 0x5a9bd8, 0x41291f);
        this.#createCustomerTextureIfMissing(ASSET_KEYS.DINER_CUSTOMER_2, 0xf2a65a, 0x2f211d);
        this.#createCustomerTextureIfMissing(ASSET_KEYS.DINER_CUSTOMER_3, 0x77c66e, 0x543328);
        this.#createCustomerTextureIfMissing(ASSET_KEYS.DINER_CUSTOMER_4, 0xc985d8, 0x1f2f44);

        this.#createTextureIfMissing(ASSET_KEYS.DINER_BURGER, 28, 24, (graphics) => {
            graphics.fillStyle(0xe9ad4f, 1);
            graphics.fillEllipse(14, 7, 24, 10);
            graphics.fillStyle(0x5a2a19, 1);
            graphics.fillRoundedRect(3, 10, 22, 5, 2);
            graphics.fillStyle(0x4ebf61, 1);
            graphics.fillRect(4, 15, 20, 3);
            graphics.fillStyle(0xe7b15a, 1);
            graphics.fillEllipse(14, 18, 23, 8);
        });

        this.#createTextureIfMissing(ASSET_KEYS.DINER_COFFEE, 28, 24, (graphics) => {
            graphics.fillStyle(0xf1f1e6, 1);
            graphics.fillRoundedRect(6, 8, 14, 12, 3);
            graphics.lineStyle(3, 0xf1f1e6, 1);
            graphics.strokeCircle(21, 14, 5);
            graphics.fillStyle(0x5a3427, 1);
            graphics.fillRect(8, 10, 10, 4);
            graphics.lineStyle(1, 0xb6c6d0, 1);
            graphics.lineBetween(10, 4, 9, 0);
            graphics.lineBetween(15, 4, 15, 0);
        });

        this.#createTextureIfMissing(ASSET_KEYS.DINER_FRIES, 28, 24, (graphics) => {
            graphics.lineStyle(3, 0xffd15c, 1);
            graphics.lineBetween(8, 4, 8, 16);
            graphics.lineBetween(12, 2, 12, 16);
            graphics.lineBetween(16, 4, 16, 16);
            graphics.lineBetween(20, 3, 20, 16);
            graphics.fillStyle(0xd43d35, 1);
            graphics.fillTriangle(5, 11, 23, 11, 19, 23);
            graphics.fillTriangle(5, 11, 9, 23, 19, 23);
            graphics.fillStyle(0xffffff, 1);
            graphics.fillRect(10, 15, 8, 3);
        });
    }

    #createCustomerTextureIfMissing(key, shirtColor, hairColor) {
        this.#createTextureIfMissing(key, 28, 34, (graphics) => {
            graphics.fillStyle(hairColor, 1);
            graphics.fillCircle(14, 8, 7);
            graphics.fillStyle(shirtColor, 1);
            graphics.fillRoundedRect(7, 15, 14, 15, 4);
            graphics.fillStyle(0x2c1a14, 1);
            graphics.fillRect(8, 29, 5, 5);
            graphics.fillRect(15, 29, 5, 5);
        });
    }

    #createTextureIfMissing(key, width, height, drawTexture) {
        if (this.textures.exists(key)) return;

        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        drawTexture(graphics);
        graphics.generateTexture(key, width, height);
        graphics.destroy();
    }
}
