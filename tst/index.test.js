import Client from "../src";

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
