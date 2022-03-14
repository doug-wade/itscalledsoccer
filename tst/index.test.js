import fetch from "isomorphic-fetch";

import Client from "../src";
import { BASE_URL, LEAGUES } from "../src/constants";
import mockXgoalsPayload from "./mocks/xgoals-payload";

jest.mock("isomorphic-fetch");

describe("client", () => {
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

describe("getXgoals", () => {
  beforeEach(() => {
    jest.resetAllMocks();

    fetch.mockImplementation(() =>
      Promise.resolve({
        async json() {
          return mockXgoalsPayload;
        },
      })
    );
  });

  it("gets with no arguments", async () => {
    const client = new Client();
    const results = await client.getXgoals({});

    expect(fetch).toHaveBeenCalledTimes(LEAGUES.length);
    LEAGUES.forEach((league) => {
      expect(fetch).toHaveBeenCalledWith(`${BASE_URL}${league}/players/xgoals`);
    });
    expect(results.length).toBe(mockXgoalsPayload.length * LEAGUES.length);
  });

  it("gets with leagues argument", async () => {
    const leaguesArgument = [LEAGUES[0], LEAGUES[2]];

    const client = new Client();
    const results = await client.getXgoals({ leagues: leaguesArgument });

    expect(fetch).toHaveBeenCalledTimes(leaguesArgument.length);
    leaguesArgument.forEach((leagueArgument) => {
      expect(fetch).toHaveBeenCalledWith(
        `${BASE_URL}${leagueArgument}/players/xgoals`
      );
    });
    expect(results.length).toBe(
      mockXgoalsPayload.length * leaguesArgument.length
    );
  });

  it("gets with other arguments", async () => {
    const mockLeague = LEAGUES[1];
    const mockSeasonName = "2021";
    const mockGeneralPosition = "W";

    const client = new Client();
    const results = await client.getXgoals({
      leagues: [mockLeague],
      seasonName: mockSeasonName,
      generalPosition: mockGeneralPosition,
    });

    expect(fetch).toHaveBeenCalledWith(
      `${BASE_URL}${mockLeague}/players/xgoals?season_name=${mockSeasonName}&general_position=${mockGeneralPosition}`
    );
  });
});
