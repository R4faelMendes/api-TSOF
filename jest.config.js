export default {
  testEnvironment: "node",
  transform: {},
  testMatch: [
    "**/__test__/**/*.test.js",
    "**/__test__/**/*.jest.js",
  ],
  collectCoverageFrom: [
    "src/**/*.js",
    "!src/server.js",
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov", "html"],
};