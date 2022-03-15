import fetch from "isomorphic-fetch";

import Client from "../src";
import { BASE_URL, LEAGUES } from "../src/constants";
import mockPlayersXgoalsPayload from "./mocks/players-xgoals-payload";
import mockPlayersXpassPayload from "./mocks/players-xpass-payload";
import mockPlayersGoalsAddedPayload from "./mocks/players-goals-added-payload";

jest.mock("isomorphic-fetch");

describe("client", () => {
  describe("constructor", () => {
    it("instantiates with no arguments", () => {
      expect(() => {
        new Client();
      }).not.toThrow();
    });

    it("instantiates with the minimumFuseScore argument", () => {
      expect(() => {
        new Client({ minimumFuseScore: 0.75 });
      }).not.toThrow();
    });
  });

  describe("get players methods", () => {
    const testParameters = [
      {
        method: "getPlayersXpass",
        payload: mockPlayersXpassPayload,
        urlFragment: "/players/xpass",
      },
      {
        method: "getPlayersXgoals",
        payload: mockPlayersXgoalsPayload,
        urlFragment: "/players/xgoals",
      },
      {
        method: "getPlayersGoalsAdded",
        payload: mockPlayersGoalsAddedPayload,
        urlFragment: "/players/goals-added",
      },
    ];

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it.each(testParameters)(
      "gets with no arguments",
      async ({ method, payload, urlFragment }) => {
        fetch.mockImplementation(() =>
          Promise.resolve({
            async json() {
              return payload;
            },
          })
        );
        const client = new Client();
        const results = await client[method]({});

        expect(fetch).toHaveBeenCalledTimes(LEAGUES.length);
        LEAGUES.forEach((league) => {
          expect(fetch).toHaveBeenCalledWith(
            `${BASE_URL}${league}${urlFragment}`
          );
        });
        expect(results.length).toBe(payload.length * LEAGUES.length);
      }
    );

    it.each(testParameters)(
      "gets with leagues argument",
      async ({ method, payload, urlFragment }) => {
        fetch.mockImplementation(() =>
          Promise.resolve({
            async json() {
              return payload;
            },
          })
        );
        const leaguesArgument = [LEAGUES[0], LEAGUES[2]];

        const client = new Client();
        const results = await client[method]({
          leagues: leaguesArgument,
        });

        expect(fetch).toHaveBeenCalledTimes(leaguesArgument.length);
        leaguesArgument.forEach((leagueArgument) => {
          expect(fetch).toHaveBeenCalledWith(
            `${BASE_URL}${leagueArgument}${urlFragment}`
          );
        });
        expect(results.length).toBe(payload.length * leaguesArgument.length);
      }
    );

    it.each(testParameters)(
      "gets with other arguments",
      async ({ method, payload, urlFragment }) => {
        fetch.mockImplementation(() =>
          Promise.resolve({
            async json() {
              return payload;
            },
          })
        );
        const mockLeague = LEAGUES[1];
        const mockMinimumPasses = 42;
        const mockMinimumMinutes = 1000;
        const mockSeasonName = "2021";
        const mockGeneralPosition = "W";

        const client = new Client();
        await client[method]({
          leagues: [mockLeague],
          minimumPasses: mockMinimumPasses,
          minimumMinutes: mockMinimumMinutes,
          seasonName: mockSeasonName,
          generalPosition: mockGeneralPosition,
        });

        expect(fetch).toHaveBeenCalledWith(
          `${BASE_URL}${mockLeague}${urlFragment}?minimum_passes=${mockMinimumPasses}&minimum_minutes=${mockMinimumMinutes}&season_name=${mockSeasonName}&general_position=${mockGeneralPosition}`
        );
      }
    );
  });
});
