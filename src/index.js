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
  async #getDependentEntities({ entityTypes }) {
    return Promise.all(
      entityTypes.map(async (entity) => {
        if (CACHE.has(entity)) {
          return CACHE.get(entity);
        }

        const result = await this.#getEntity({ entity });
        CACHE.set(entity, result);
        return result;
      })
    );
  }

  async #getEntity({ entity }) {
    const pluralEntity = pluralize(entity);

    const leagueArray = await Promise.all(
      LEAGUES.map(async (league) => {
        const url = `${BASE_URL}${league}/${pluralEntity}`;
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
    const dependentEntities = await this.#getDependentEntities({
      entityTypes: [entityType],
    });
    const players = dependentEntities[0];

    if (!this.#fuse) {
      this.#fuse = new Fuse(players, {
        includeScore: true,
        keys: ["player_name"], // TODO: stadia and managers and stuff
      });
    }

    const result = this.#fuse.search(name);
    if (!result[0] || result[0].score < MIN_FUSE_SCORE) {
      throw new Error(`Name ${name} does not match any known name`);
    }

    return result[0].item;
  }

  /* public-facing api */
  async getPlayers({ leagues = LEAGUES, ids = [], names } = {}) {
    let concatenatedIds = [...ids];

    if (names) {
      const players = await Promise.all(
        names.map((name) =>
          this.#convertNameToId({ name, entityType: ENTITY_TYPES.PLAYER })
        )
      );
      const nameIds = players.map((player) => player.player_id);

      concatenatedIds = [...concatenatedIds, ...nameIds];
    }

    const results = await Promise.all(
      // TODO: When we have ids, we fetch the data for all leagues, regardless of whether we have a player
      // in that league or not. If we've already fetched the players, it makes sense for us to only fetch
      // those leagues that have a player in them.
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
