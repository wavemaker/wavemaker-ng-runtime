import resolve from '@rollup/plugin-node-resolve';
import rollupGlobals, {rollupExternals} from './rollup-utils.mjs';

export default [
    {
        input: './node_modules/fast-xml-parser/src/fxp.js',
        external: [ ...rollupExternals ],
        output: {
            file: './node_modules/fast-xml-parser/src/bundles/fxp.umd.js',
            format: 'umd',
            name: 'fastXmlParser',
            globals: rollupGlobals
        },
        plugins: [
            resolve()
        ]
    },
]