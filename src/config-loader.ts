import * as TsConfigLoader from "./tsconfig-loader";
import * as path from "path";

export interface ExplicitParams {
  baseUrl: string;
  paths: { [key: string]: Array<string> };
}

interface ConfigLoaderParams {
  tsConfigLoader?: (
    params: TsConfigLoader.TsConfigLoaderParams
  ) => TsConfigLoader.TsConfigLoaderResult;
  explicitParams: ExplicitParams | undefined;
  cwd: string;
}

export interface ConfigLoaderSuccessResult {
  resultType: "success";
  absoluteBaseUrl: string;
  paths: { [key: string]: Array<string> };
}

export interface ConfigLoaderFailResult {
  resultType: "failed";
  message: string;
}

export function configLoader({
  tsConfigLoader = TsConfigLoader.tsConfigLoader,
  explicitParams,
  cwd
}: ConfigLoaderParams): ConfigLoaderSuccessResult | ConfigLoaderFailResult {
  if (explicitParams) {
    const absoluteBaseUrl = path.isAbsolute(explicitParams.baseUrl)
      ? explicitParams.baseUrl
      : path.join(cwd, explicitParams.baseUrl);

    return {
      resultType: "success",
      absoluteBaseUrl,
      paths: explicitParams.paths
    };
  }

  // Load tsconfig and create path matching function
  const loadResult = tsConfigLoader({
    cwd,
    getEnv: (key: string) => process.env[key]
  });

  if (!loadResult.tsConfigPath) {
    return {
      resultType: "failed",
      message: "Couldn't find tsconfig.json"
    };
  }

  if (!loadResult.baseUrl) {
    return {
      resultType: "failed",
      message: "Missing baseUrl in compilerOptions"
    };
  }

  const tsConfigDir = path.dirname(loadResult.tsConfigPath);
  const absoluteBaseUrl = path.join(tsConfigDir, loadResult.baseUrl);

  return {
    resultType: "success",
    absoluteBaseUrl,
    paths: loadResult.paths || {}
  };
}
