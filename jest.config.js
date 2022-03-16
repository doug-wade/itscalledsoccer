module.exports = {
  setupFilesAfterEnv: ["./jest.setup.js"],
  coverageThreshold: {
    global: {
      branches: 37,
      statements: 35,
      functions: 54,
      lines: 36,
    },
  },
};
