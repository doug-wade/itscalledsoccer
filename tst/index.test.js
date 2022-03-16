import fetch from "isomorphic-fetch";

import Client from "../src";
import { BASE_URL, LEAGUES } from "../src/constants";

// fetch payload mocks
import mockPlayersXgoalsPayload from "./mocks/players-xgoals-payload";
import mockPlayersXpassPayload from "./mocks/players-xpass-payload";
import mockPlayersGoalsAddedPayload from "./mocks/players-goals-added-payload";
import mockPlayersSalariesPayload from "./mocks/players-salaries-payload";
import mockGoalkeepersXgoalsPayload from "./mocks/goalkeepers-xgoals-payload";
import mockGoalkeepersGoalsAddedPayload from "./mocks/goalkeepers-goals-added-payload";
import mockTeamsXgoalsPayload from "./mocks/teams-xgoals-payload";
import mockTeamsXpassPayload from "./mocks/teams-xpass-payload";
import mockTeamsGoalsAddedPayload from "./mocks/teams-goals-added-payload";
import mockTeamsSalariesPayload from "./mocks/teams-salaries-payload";
import mockGamesXgoalsPayload from "./mocks/games-xgoals-payload";

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

  describe("parameter validation", () => {
    it("logs to the console when an invalid league is provided", async () => {
      const mockLeague = "la liga";
      jest.spyOn(console, "assert").mockImplementation();
      fetch.mockImplementation(() =>
        Promise.resolve({
          async json() {
            return [];
          },
        })
      );

      const client = new Client();
      await client.getGoalkeepersGoalsAdded({
        leagues: [mockLeague],
      });

      expect(console.assert).toHaveBeenCalledWith(
        false,
        `leagues must be an array of LEAGUES, fetchEntity got ${mockLeague}`
      );
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
      {
        method: "getPlayersSalaries",
        payload: mockPlayersSalariesPayload,
        urlFragment: "/players/salaries",
      },
      {
        method: "getGoalkeepersXgoals",
        payload: mockGoalkeepersXgoalsPayload,
        urlFragment: "/goalkeepers/xgoals",
      },
      {
        method: "getGoalkeepersGoalsAdded",
        payload: mockGoalkeepersGoalsAddedPayload,
        urlFragment: "/goalkeepers/goals-added",
      },
      {
        method: "getTeamsXgoals",
        payload: mockTeamsXgoalsPayload,
        urlFragment: "/teams/xgoals",
      },
      {
        method: "getTeamsXpass",
        payload: mockTeamsXpassPayload,
        urlFragment: "/teams/xpass",
      },
      {
        method: "getTeamsGoalsAdded",
        payload: mockTeamsGoalsAddedPayload,
        urlFragment: "/teams/goals-added",
      },
      {
        method: "getTeamsSalaries",
        payload: mockTeamsSalariesPayload,
        urlFragment: "/teams/salaries",
      },
      {
        method: "getGamesXgoals",
        payload: mockGamesXgoalsPayload,
        urlFragment: "/games/xgoals",
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
        const results = await client[method]();

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
