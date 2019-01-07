import { rollupGlobals } from '../../../rollup-utils';

export default {
    input: 'dist/out-tsc/mobile/placeholder/components/index.js',
    output: {
        file: 'dist/tmp/mobile/placeholder/components/components.umd.js',
        format: 'umd',
        name: 'wm.mobile.components',
        globals: rollupGlobals
    }
}