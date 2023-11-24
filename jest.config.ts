export default {
  displayName: "quota-enforcement-service",
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.[tj]s$": ["ts-jest", { tsconfig: "./tsconfig.json" }],
  },
  moduleFileExtensions: ["ts", "js", "html"],
};
