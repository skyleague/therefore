import type { SpaceObject } from './game.type'

function isHabitable(obj: SpaceObject): boolean {
    switch (obj.type) {
        case 'asteroid':
            return false
        case 'planet':
            return obj.habitable
        case 'ship':
            return true
    }
}

export function foo(spaceObject: SpaceObject) {
    if (isHabitable(spaceObject)) {
        // ...
    }
}
