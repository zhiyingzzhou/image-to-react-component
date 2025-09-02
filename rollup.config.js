import babel from '@rollup/plugin-babel';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { nodeResolve } from '@rollup/plugin-node-resolve';
const pkg = require('./package.json');

const libraryName = 'index';

export default {
  input: `compiled/${libraryName}.js`,
  output: [
    // {
    //   file: pkg.main,
    //   name: libraryName,
    //   format: 'umd',
    //   inlineDynamicImports: true,
    // },
    { file: pkg.module, format: 'es', inlineDynamicImports: true },
    { file: pkg.main, format: 'cjs', inlineDynamicImports: true },
    // { dir: 'dist', format: "es" }
  ],
  // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
  external: [/node_modules/],
  watch: {
    include: 'compiled/**',
  },
  plugins: [
    json(),
    // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
    commonjs(),
    // Allow node_modules resolution, so you can use 'external' to control
    // which external modules to include in the bundle
    // https://github.com/rollup/plugins/tree/master/packages/node-resolve
    nodeResolve(),

    babel({
      exclude: 'node_modules/**',
      babelHelpers: 'bundled',
    }),
  ],
};
