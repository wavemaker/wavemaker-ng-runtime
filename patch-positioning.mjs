#!/usr/bin/env node

/**
 * Patches ngx-bootstrap positioning.umd.js to fix Angular 20 takeUntilDestroyed() 
 * injection context issue when called inside ngZone.runOutsideAngular()
 */

import { readFileSync, writeFileSync } from 'fs';

const filePath = './node_modules/ngx-bootstrap/positioning/bundles/ngx-bootstrap-positioning.umd.js';

console.log('Patching ngx-bootstrap PositioningService for Angular 20...');

let content = readFileSync(filePath, 'utf8');

// Step 1: Add DestroyRef injection at the beginning of the constructor
// Find the constructor and add the capture before ngZone.runOutsideAngular
const constructorPattern = /(constructor\(ngZone, rendererFactory, platformId\)\s*{[^}]*this\.isDisabled\s*=\s*false;)/;
const constructorReplacement = '$1\n            const __destroyRef = i0.inject(i0.DestroyRef);';

// Step 2: Replace takeUntilDestroyed() with takeUntilDestroyed(__destroyRef)
const takeUntilPattern = /rxjsInterop\.takeUntilDestroyed\(\)/g;
const takeUntilReplacement = 'rxjsInterop.takeUntilDestroyed(__destroyRef)';

let patched = false;

if (content.match(constructorPattern)) {
    content = content.replace(constructorPattern, constructorReplacement);
    patched = true;
    console.log('✅ Step 1: Added DestroyRef injection at constructor start');
} else {
    console.log('⚠️  Constructor pattern not found');
}

if (content.match(takeUntilPattern)) {
    content = content.replace(takeUntilPattern, takeUntilReplacement);
    patched = true;
    console.log('✅ Step 2: Updated takeUntilDestroyed() to use captured DestroyRef');
} else {
    console.log('⚠️  takeUntilDestroyed pattern not found');
}

if (patched) {
    writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully patched PositioningService!');
} else {
    console.log('❌ No patterns matched - check the file structure');
}

