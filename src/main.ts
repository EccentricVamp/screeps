import Build from "Tasks/Build";
import Harvest from "Tasks/Harvest";
import Renew from "Tasks/Renew";
import Task from "Tasks/Task";
import Transport from "Tasks/Transport";
import Upgrade from "Tasks/Upgrade";
import _ from "lodash";

declare global {
  interface CreepMemory {
    status: number | null;
  }
}

export const loop = (): void => {
  const STORES = [STRUCTURE_CONTAINER, STRUCTURE_STORAGE];
  const NEEDS = [STRUCTURE_EXTENSION, STRUCTURE_SPAWN];

  function hasEnergy(structure: AnyStructure): structure is StructureContainer | StructureStorage {
    return (
      _.includes(STORES, structure.structureType) &&
      (structure as StructureContainer | StructureStorage).store[RESOURCE_ENERGY] > 0
    );
  }

  function hasFreeCapacity(structure: AnyStructure): structure is StructureContainer | StructureStorage {
    return (
      _.includes(STORES, structure.structureType) &&
      (structure as StructureContainer | StructureStorage).store.getFreeCapacity() > 0
    );
  }

  function needsEnergy(structure: AnyStructure): structure is StructureExtension | StructureSpawn {
    return (
      _.includes(NEEDS, structure.structureType) &&
      (structure as StructureExtension | StructureSpawn).store.getFreeCapacity(RESOURCE_ENERGY) > 0
    );
  }

  const RENEWING = 99;
  const RENEW_THRESHOLD = 500;

  const tasks = new Array<Task>();
  const room = Object.values(Game.rooms)[0];
  const controller = room.controller;
  const spawn = room.find(FIND_MY_SPAWNS)[0];
  const energyNeeds = room.find(FIND_MY_STRUCTURES, { filter: needsEnergy });
  const creeps = room.find(FIND_MY_CREEPS, { filter: { spawning: false } });
  const sites = room.find(FIND_CONSTRUCTION_SITES);
  const energyStores = room.find(FIND_STRUCTURES, { filter: hasEnergy });
  const freeStores = room.find(FIND_STRUCTURES, { filter: hasFreeCapacity });

  const renew = new Renew(spawn);
  for (const creep of creeps) {
    if ((creep.ticksToLive !== undefined && creep.ticksToLive < RENEW_THRESHOLD) || creep.memory.status === RENEWING) {
      const complete = renew.perform(creep);
      if (complete) creep.memory.status = null;
      else _.remove(creeps, creep);
    }
  }

  if (energyNeeds.length > 0) {
    const need = energyNeeds[0];
    if (energyStores.length > 0 && needsEnergy(need)) {
      const store = energyStores[0];
      if (store !== null && hasEnergy(store)) {
        const transport = new Transport(RESOURCE_ENERGY, store, need);
        tasks.push(transport);
      }
    } else {
      const source = need.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
      if (source !== null && needsEnergy(need)) {
        const harvest = new Harvest(RESOURCE_ENERGY, source, need);
        tasks.push(harvest);
      }
    }
  }

  if (freeStores.length > 0) {
    const store = freeStores[0];
    const source = store.pos.findClosestByRange(FIND_SOURCES_ACTIVE);
    if (source !== null && hasFreeCapacity(store)) {
      const harvest = new Harvest(RESOURCE_ENERGY, source, store);
      tasks.push(harvest);
    }
  }

  if (energyStores.length > 0) {
    const store = energyStores[0];
    if (controller !== undefined && hasEnergy(store)) {
      const upgrade = new Upgrade(store, controller);
      tasks.push(upgrade);
    }
  }

  if (sites.length > 0) {
    const site = sites[0];
    if (energyStores.length > 0) {
      const store = energyStores[0];
      if (hasEnergy(store)) {
        const build = new Build(store, site);
        tasks.push(build);
        tasks.push(build);
        tasks.push(build);
      }
    }
  }

  for (const task of tasks) {
    let complete = false;

    const interviewees = _.sortBy(creeps, task.interview);
    const creep = _.last(interviewees);
    if (creep === undefined) break;

    _.pull(creeps, creep);
    complete = task.perform(creep);
    if (complete) {
      creep.memory.status = null;
      creeps.push(creep);
    }
  }

  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
};
