import commonjs from '@rollup/plugin-commonjs';
import {nodeResolve} from "@rollup/plugin-node-resolve";

export default {
    input: './node_modules/core-js/index.js',
    output: {
        file: './dist/tmp/libs/core-js/core-js.umd.js',
        format: 'umd',
        name: 'coreJsBundle',
    },
    plugins: [
        nodeResolve(),
        commonjs()
    ]
};
