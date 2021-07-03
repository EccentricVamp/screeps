'use strict';

var _ = require('lodash');

class Build {
    constructor(target) {
        this.parts = [MOVE, CARRY, WORK];
        this.resources = [RESOURCE_ENERGY];
        this.target = target;
    }
    execute(creep) {
        return creep.build(this.target);
    }
}

class Claim {
    constructor(target) {
        this.parts = [MOVE, CLAIM];
        this.resources = [];
        this.target = target;
    }
    execute(creep) {
        return creep.claimController(this.target);
    }
}

class Harvest {
    constructor(target) {
        this.parts = [MOVE, CARRY, WORK];
        this.resources = [];
        this.target = target;
    }
    execute(creep) {
        const result = creep.harvest(this.target);
        if (creep.store.getFreeCapacity() === 0)
            return ERR_FULL;
        else
            return result;
    }
}

class Pickup {
    constructor(target) {
        this.parts = [MOVE, CARRY];
        this.resources = [];
        this.target = target;
    }
    execute(creep) {
        return creep.pickup(this.target);
    }
}

class Recycle {
    constructor(target) {
        this.parts = [];
        this.resources = [];
        this.target = target;
    }
    execute(creep) {
        return this.target.recycleCreep(creep);
    }
}

class Renew {
    constructor(target) {
        this.parts = [];
        this.resources = [RESOURCE_ENERGY];
        this.target = target;
    }
    execute(creep) {
        return this.target.renewCreep(creep);
    }
}

class Repair {
    constructor(target) {
        this.parts = [MOVE, CARRY, WORK];
        this.resources = [RESOURCE_ENERGY];
        this.target = target;
    }
    execute(creep) {
        return creep.repair(this.target);
    }
}

class Transfer {
    constructor(target, resource = RESOURCE_ENERGY) {
        this.parts = [MOVE, CARRY];
        this.resources = [resource];
        this.target = target;
    }
    execute(creep) {
        const resource = this.resources[0];
        const result = creep.transfer(this.target, resource);
        if (creep.store[resource] === 0)
            return ERR_NOT_ENOUGH_RESOURCES;
        else
            return result;
    }
}

class Upgrade {
    constructor(target) {
        this.parts = [MOVE, CARRY, WORK];
        this.resources = [RESOURCE_ENERGY];
        this.target = target;
    }
    execute(creep) {
        return creep.upgradeController(this.target);
    }
}

class Withdraw {
    constructor(target, resource = RESOURCE_ENERGY) {
        this.parts = [MOVE, CARRY];
        this.resources = [resource];
        this.target = target;
    }
    execute(creep) {
        return creep.withdraw(this.target, this.resources[0]);
    }
}

/** Returns the union of the parts required for each act */
function getParts(acts) {
    const actParts = acts.map(a => a.parts);
    return _['default'].union(...actParts);
}

exports.Build = Build;
exports.Claim = Claim;
exports.Harvest = Harvest;
exports.Pickup = Pickup;
exports.Recycle = Recycle;
exports.Renew = Renew;
exports.Repair = Repair;
exports.Transfer = Transfer;
exports.Upgrade = Upgrade;
exports.Withdraw = Withdraw;
exports.getParts = getParts;
