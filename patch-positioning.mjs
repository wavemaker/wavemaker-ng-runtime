#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';

const filePath = './node_modules/ngx-bootstrap/positioning/bundles/ngx-bootstrap-positioning.umd.js';

console.log('Patching ngx-bootstrap PositioningService for Angular 20...');

if (!existsSync(filePath)) {
    console.log(`❌ File not found: ${filePath}`);
    process.exit(1);
}

let content = readFileSync(filePath, 'utf8');

// Check if already patched
if (content.includes('const __destroyRef = i0.inject(i0.DestroyRef)')) {
    console.log('✅ File is already patched, skipping...');
    process.exit(0);
}

// Step 1: Inject DestroyRef at the beginning of the constructor
const constructorPattern = /(constructor\(ngZone, rendererFactory, platformId\)\s*\{[^}]*)(if\s*\(common\.isPlatformBrowser|if\s*\(isPlatformBrowser)/;
const constructorReplacement = '$1const __destroyRef = i0.inject(i0.DestroyRef);\n            $2';

// Step 2: Replace takeUntilDestroyed() with takeUntilDestroyed(__destroyRef)
const takeUntilPattern = /rxjsInterop\.takeUntilDestroyed\(\)/g;
const takeUntilReplacement = 'rxjsInterop.takeUntilDestroyed(__destroyRef)';

let patched = false;

if (content.match(constructorPattern)) {
    content = content.replace(constructorPattern, constructorReplacement);
    patched = true;
    console.log('✅ Step 1: Added DestroyRef injection in constructor');
} else {
    console.log('❌ Constructor pattern not found');
}

if (content.match(takeUntilPattern)) {
    content = content.replace(takeUntilPattern, takeUntilReplacement);
    patched = true;
    console.log('✅ Step 2: Updated takeUntilDestroyed() to use DestroyRef');
} else {
    console.log('⚠️  takeUntilDestroyed pattern not found');
}

if (patched) {
    writeFileSync(filePath, content, 'utf8');
    console.log('✅ Successfully patched PositioningService!');
} else {
    console.log('❌ No patterns matched - patch failed');
    process.exit(1);
}
