import fetch from "isomorphic-fetch";
import "core-js/stable";
import "regenerator-runtime/runtime";
import Fuse from "fuse.js";

import pluralize from "./pluralize";
import { BASE_URL, ENTITY_TYPES, LEAGUES, MIN_FUSE_SCORE } from "./constants";

const CACHE = new Map();

export default class Client {
  #fuses = new Map();
  #minimumFuseScore;

  constructor({ minimumFuseScore }) {
    this.#minimumFuseScore = minimumFuseScore || MIN_FUSE_SCORE;
  }

  /* utils */
  async #getDependentEntities({ entityTypes }) {
    console.assert(
      entityTypes.every((entityType) => ENTITY_TYPES.includes(entityType)),
      `entityTypes must be an array of ENTITY_TYPES; getDependentEntities got ${entityTypes}`
    );

    return Promise.all(
      entityTypes.map(async (entityType) => {
        if (CACHE.has(entityType)) {
          return CACHE.get(entityType);
        }

        const result = await this.#getEntity({ entityType });
        CACHE.set(entityType, result);
        return result;
      })
    );
  }

  async #getEntity({ entityType }) {
    console.assert(
      ENTITY_TYPES.includes(entityType),
      `entity must be one of ENTITY_TYPES, getEntity got ${entityType}`
    );
    const pluralEntityType = pluralize(entityType);

    const leagueArray = await Promise.all(
      LEAGUES.map(async (league) => {
        const url = `${BASE_URL}${league}/${pluralEntityType}`;

        console.log(`getEntity fetching url: ${url}`);
        const result = await fetch(url);

        return result.json();
      })
    );

    return leagueArray.reduce((accumulator, league) => {
      accumulator.concat(league);
      return accumulator;
    });
  }

  async #convertNameToId({ name, entityType }) {
    console.assert(
      name instanceof String,
      `name must be a string, convertNameToId got: ${name}`
    );
    console.assert(
      Object.values(ENTITY_TYPES).includes(entityType),
      `entityType must be one of ENTITY_TYPES; convertNameToId got ${entityType}`
    );

    const dependentEntities = await this.#getDependentEntities({
      entityTypes: [entityType],
    });
    const players = dependentEntities[0];

    let fuse;
    if (!this.#fuses.has(entityType)) {
      fuse = new Fuse(players, {
        includeScore: true,
        keys: [`${entityType}_name`],
      });
      this.#fuses.set(entityType, fuse);
    } else {
      fuse = this.#fuses.get(entityType);
    }

    const result = fuse.search(name);
    if (!result[0] || result[0].score < this.#minimumFuseScore) {
      throw new Error(`Name ${name} does not match any known name`);
    }

    return result[0].item;
  }

  async #getEntityIdsByName({ names = [], entityType }) {
    console.assert(
      Object.values(ENTITY_TYPES).includes(entityType),
      `entityType must be one of ENTITY_TYPES; getEntityIdsByName got ${entityType}`
    );

    if (!names.length) {
      return [];
    }

    const entites = await Promise.all(
      names.map((name) =>
        this.#convertNameToId({ name, entityType: ENTITY_TYPES.PLAYER })
      )
    );

    return entites.map((entity) => entity[`${entityType}_id`]);
  }

  async #fetchEntity({ leagues, entityType, ids }) {
    console.assert(
      leagues.every((league) => Object.values(LEAGUES).includes(league)),
      `leagues must be an array of LEAGUES, fetchEntity got ${leagues}`
    );
    console.assert(
      Object.values(ENTITY_TYPES).includes(entityType),
      `entityType must be one of ENTITY_TYPES, fetchEntity got ${entityType}`
    );
    console.assert(
      ids.every((id) => id instanceof String),
      `ids must be an array of strings, fetchEntity got ${ids}`
    );

    const results = await Promise.all(
      // TODO: When we have ids, we fetch the data for all leagues, regardless of whether we have a entity
      // in that league or not. If we haven't already fetched the players, it makes sense for us to only fetch
      // those leagues that have a player in them.
      leagues.map(async (league) => {
        const url = `${BASE_URL}${league}/${pluralize(entityType)}${
          ids.length ? `?${entityType}_id=${ids.join(",")}` : ""
        }`;

        console.log(`fetchEntity fetching url ${url}`);

        const response = await fetch(url);

        if (response.status >= 400) {
          // TODO: We should definitely have better error messaging here.
          throw new Error(
            `Got a bad response from the server: ${response.status}`
          );
        }

        return response.json();
      })
    );

    return results.reduce((acc, curr) => acc.concat(curr), []);
  }

  /* public-facing api */
  async getPlayers({ leagues = LEAGUES, ids = [], names } = {}) {
    const nameIds = await this.#getEntityIdsByName({
      names,
      entityType: ENTITY_TYPES.PLAYER,
    });
    const concatenatedIds = [...nameIds, ...ids];

    return this.#fetchEntity({
      ids: concatenatedIds,
      entityType: ENTITY_TYPES.PLAYER,
      leagues,
    });
  }

  async getManagers({ leagues = LEAGUES, ids = [], names = [] }) {
    const nameIds = await this.#getEntityIdsByName({
      names,
      entityType: ENTITY_TYPES.MANAGER,
    });
    const concatenatedIds = [...nameIds, ...ids];

    console.log("concatenatedIds: ", concatenatedIds);

    return this.#fetchEntity({
      ids: concatenatedIds,
      entityType: ENTITY_TYPES.MANAGER,
      leagues,
    });
  }
}
