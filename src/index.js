import fetch from "isomorphic-fetch";
import "core-js/stable";
import "regenerator-runtime/runtime";
import Fuse from "fuse.js";

import pluralize from "./pluralize";
import {
  API_VERSION,
  BASE_URL,
  ENTITY_TYPES,
  LEAGUES,
  MAX_API_LIMIT,
  MIN_FUSE_SCORE,
  NAME_TYPES,
} from "./constants";

const CACHE = new Map();

export default class Client {
  #fuse;

  /* utils */
  async #initializeDependentEntities({ entityTypes }) {
    return Promise.all(
      entityTypes.map(async (entity) => {
        if (this[entity]) {
          return this[entity];
        }

        const result = await this.#getEntity({ entity });
        this[entity] = result;
        return result;
      })
    );
  }

  async #convertNameToId({ name, entityType }) {
    const entities = await this.#initializeDependentEntities({
      entityTypes: [entityType],
    });

    if (!this.#fuse) {
      // Since there is only ever a single entityType, this is a needlessly complicated way to write `entities[0]`
      const list = entities.reduce(
        (accumulator, entity) => accumulator.concat(entity),
        []
      );

      this.#fuse = new Fuse(list, { includeScore: true });
    }

    const result = this.#fuse.search(name);
    console.log("result", result);
    if (!result[0] || result[0].score < MIN_FUSE_SCORE) {
      throw new Error(`Name ${name} does not match any known name`);
    }

    return result[0].item;
  }

  async #getEntity({ entity }) {
    const pluralEntity = pluralize(entity);
    return Promise.all(
      LEAGUES.map(async (league) => {
        const url = `${BASE_URL}${league}/${pluralEntity}`;
        const result = await fetch(url);

        return result.json();
      })
    );
  }

  /* public-facing api */
  async getPlayers({ leagues = LEAGUES, ids, names } = {}) {
    // take a defensive copy
    let concatenatedIds = ids ? [...ids] : [];

    if (names) {
      const nameIds = await Promise.all(
        names.map((name) => {
          try {
            this.#convertNameToId({ name, entityType: ENTITY_TYPES.PLAYER });
          } catch (e) {
            console.error(e);
          }
        })
      );

      concatenatedIds = [...concatenatedIds, ...nameIds];
    }

    const results = await Promise.all(
      leagues.map(async (league) => {
        const url = `${BASE_URL}${league}/players${
          concatenatedIds ? "?player_id=" + concatenatedIds.join(",") : ""
        }`;

        const response = await fetch(url);

        if (response.status >= 400) {
          throw new Error(
            `Got a bad response from the server ${response.status}`
          );
        }

        return response.json();
      })
    );

    return results.reduce((acc, curr) => acc.concat(curr), []);
  }
}
