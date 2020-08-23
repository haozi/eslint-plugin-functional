/**
 * Rollup Config.
 */
// @ts-check

import rollupPluginCommonjs from "@rollup/plugin-commonjs";
import rollupPluginNodeResolve from "@rollup/plugin-node-resolve";
import rollupPluginReplace from "@rollup/plugin-replace";
import rollupPluginTypescript from "@rollup/plugin-typescript";

import { version } from "./package.json";

import {
  isAbsolute as isAbsolutePath,
  join as joinPaths,
  normalize as normalizePath,
} from "path";

const pluginConfig = {
  replace: {
    __buildVersion: `"${version}"`,
  },
};

const common = {
  input: "src/index.ts",

  external: (id) => {
    const localPaths = [".", process.cwd()];
    const excludedPaths = ["node_modules"];
    const normalId = isAbsolutePath(id) ? normalizePath(id) : id;

    return !localPaths.some(
      (localPath) =>
        // Local file?
        normalId.startsWith(localPath) &&
        // Not excluded?
        !excludedPaths.some((excludePath) =>
          normalId.startsWith(joinPaths(localPath, excludePath))
        )
    );
  },

  treeshake: {
    annotations: true,
    moduleSideEffects: [
      "array.prototype.flatmap/auto.js",
      "object.fromentries/auto.js",
    ],
    propertyReadSideEffects: false,
  },
};

const cjs = {
  ...common,

  output: {
    dir: "./lib",
    entryFileNames: "[name].js",
    chunkFileNames: "common/[hash].js",
    format: "cjs",
    sourcemap: false,
  },

  plugins: [
    rollupPluginNodeResolve(),
    rollupPluginCommonjs(),
    rollupPluginReplace(pluginConfig.replace),
    rollupPluginTypescript(),
  ],
};

const esm = {
  ...common,

  output: {
    dir: "./lib",
    entryFileNames: "[name].mjs",
    chunkFileNames: "common/[hash].mjs",
    format: "esm",
    sourcemap: false,
  },

  plugins: [
    rollupPluginNodeResolve(),
    rollupPluginCommonjs(),
    rollupPluginReplace(pluginConfig.replace),
    rollupPluginTypescript(),
  ],
};

export default [cjs, esm];
