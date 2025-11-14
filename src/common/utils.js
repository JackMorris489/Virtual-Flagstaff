import { DIRECTION } from "./common";

export function isArcadePhysicsBody(body) {
    if (body === undefined || body === null) {
        return false;
    }

    return body instanceof Phaser.Physics.Arcade.Body;
}

export function isDirection(direction) {
    return DIRECTION[direction] !== undefined;
}