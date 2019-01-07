import { rollupGlobals } from '../../rollup-utils';

export default {
    input: 'dist/out-tsc/mobile/offline/index.js',
    output: {
        file: 'dist/tmp/mobile/offline/offline.umd.js',
        format: 'umd'
    },
    name: 'wm.mobile.offline',
    globals: rollupGlobals
};