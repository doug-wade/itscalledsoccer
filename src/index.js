import fetch from "isomorphic-fetch";
import "core-js/stable";
import "regenerator-runtime/runtime";

const API_VERSION = "v1";
const BASE_URL = `https://app.americansocceranalysis.com/api/${API_VERSION}/`;
const LEAGUES = ["nwsl", "mls", "uslc", "usl1", "nasl"];
const MAX_API_LIMIT = 1000;
const CACHE = new Map();

export default class Client {
  async getPlayers({ leagues = LEAGUES, ids } = {}) {
    const results = await Promise.all(
      leagues.map(async (league) => {
        const url = `${BASE_URL}${league}/players${
          ids ? "?player_id=" + ids.join(",") : ""
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
