export const API_VERSION = "v1";
export const BASE_URL = `https://app.americansocceranalysis.com/api/${API_VERSION}/`;
export const LEAGUES = ["nwsl", "mls", "uslc", "usl1", "nasl"];
export const MAX_API_LIMIT = 1000;
export const MAX_FUSE_SCORE = 0.35;

export const ENTITY_TYPES = Object.freeze({
  PLAYER: "player",
  MANAGER: "manager",
  STADIUM: "stadium",
  REFEREE: "referee",
  TEAM: "team",
});
