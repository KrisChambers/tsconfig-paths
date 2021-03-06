import { assert } from "chai";
import { tsConfigLoader } from "../src/tsconfig-loader";

describe("tsconfig-loader", function() {
  it("should find tsconfig in cwd", () => {
    const result = tsConfigLoader({
      cwd: "/foo/bar",
      getEnv: (_: string) => undefined,
      loadSync: (cwd: string) => {
        return {
          tsConfigPath: `${cwd}/tsconfig.json`,
          baseUrl: "./",
          paths: {}
        };
      }
    });

    assert.equal(result.tsConfigPath, "/foo/bar/tsconfig.json");
  });

  it("should return loaderResult.tsConfigPath as undefined when not found", () => {
    const result = tsConfigLoader({
      cwd: "/foo/bar",
      getEnv: (_: string) => undefined,
      loadSync: (_: string) => {
        return {
          tsConfigPath: undefined,
          baseUrl: "./",
          paths: {}
        };
      }
    });

    assert.isUndefined(result.tsConfigPath);
  });

  it("should use TS_NODE_PROJECT env if exists", () => {
    const result = tsConfigLoader({
      cwd: "/foo/bar",
      getEnv: (key: string) =>
        key === "TS_NODE_PROJECT" ? "/foo/baz" : undefined,
      loadSync: (cwd: string, fileName: string) => {
        if (cwd === "/foo/bar" && fileName === "/foo/baz") {
          return {
            tsConfigPath: "/foo/baz/tsconfig.json",
            baseUrl: "./",
            paths: {}
          };
        }

        return {
          tsConfigPath: undefined,
          baseUrl: "./",
          paths: {}
        };
      }
    });

    assert.equal(result.tsConfigPath, "/foo/baz/tsconfig.json");
  });
});
