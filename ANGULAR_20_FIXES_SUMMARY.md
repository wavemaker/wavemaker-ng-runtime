# Angular 20 Migration - Fixes Summary

## Issue: Page Content Not Rendering

### Root Cause
The page template uses `<ng-container *ngIf="compilePageContent">` but `compilePageContent` was not declared as a class property in `BasePageComponent`. It was being set as `(this as any).compilePageContent = true`, which doesn't work with Angular 20's change detection for `*ngIf`.

### Solution
Added `compilePageContent: boolean = false;` as a class property in `BasePageComponent` (line 59) and changed the assignment from `(this as any).compilePageContent = true` to `this.compilePageContent = true` (line 332).

**File:** `projects/runtime-base/src/components/base-page.component.ts`

```typescript
// Line 59 - Added property declaration
compilePageContent: boolean = false;

// Line 332 - Changed assignment
this.compilePageContent = true;  // was: (this as any).compilePageContent = true;
```

## Other Key Fixes

### 1. NG0201 Dependency Injection Errors

**Problem:** `PageDirective` was not available in dynamically created components.

**Solution:** Added factory providers in `component-ref-provider.service.ts`:

```typescript
{
    provide: PageDirective,
    useFactory: (injector: Injector) => {
        try {
            return injector.get(PageDirective);
        } catch (e) {
            const app = injector.get(App);
            return app.activePage?.pageDirective;
        }
    },
    deps: [Injector]
}
```

Also added providers for:
- `Viewport`
- `Title` (from `@angular/platform-browser`)
- `EventManager`
- `WidgetRef` (using `MockWidgetRef`)
- `EXPLICIT_CONTEXT`

**File:** `projects/runtime-dynamic/src/app/services/component-ref-provider.service.ts`

### 2. Build-Task Import Errors

**Problem:** `@wm/build-task` library was not being compiled, causing build failures.

**Solution:** 
- Removed import from `projects/runtime-base/src/services/dynamic-component-ref-provider.service.ts`
- Removed from bundle list in `build.sh` (line 157)
- Commented out rollup config in `config/rollup.wm-components.config.mjs` (lines 73-84)

### 3. Template Generation

**Status:** Using Angular's new control flow syntax (`@if`, `@for`) from `next-release` branch.

**Note:** The templates have a MIX of both syntaxes:
- `wmPageContent` uses `*ngIf="compilePageContent"` (from `page.build.ts`)
- Table columns and form fields use `@if` syntax (from other build files)

This is intentional and works correctly in Angular 20.

### 4. Test Fixes

**Fixed 50+ test files:**
- Changed `@ViewChild(Component, { static: true })` to `{ static: false }`
- Added `await fixture.whenStable()` and second `detectChanges()` in `beforeEach` blocks
- Moved standalone components from `declarations` to `imports` array

**File:** `projects/components/base/src/test/common-widget.specs.ts` + 50+ spec files

## Verification

### Local Build
✅ Build completes successfully  
✅ All artifacts generated in `dist/bundles/wmapp/scripts/`  
✅ Property declaration present in `libraries/runtime/base/bundles/index.umd.js`

### wavemakeronline.com
✅ Page renders correctly with all content  
✅ No console errors  
✅ All widgets functional

### proxy-studio.wmdev.com
⚠️ **Requires server redeployment** with updated runtime files from `dist/bundles/wmapp/scripts/`

The server is currently serving old files that don't have the `compilePageContent` property declaration.

## Deployment Steps

To fix proxy-studio.wmdev.com:

1. Build the runtime: `sh build.sh --force`
2. Copy artifacts to server:
   - From: `dist/bundles/wmapp/scripts/*`
   - To: Server's `/app-runtime/wmapp/scripts/` directory
3. Clear browser cache and reload

## Files Modified

### Core Runtime Files
- `projects/runtime-base/src/components/base-page.component.ts`
- `projects/runtime-base/src/components/base-partial.component.ts`
- `projects/runtime-dynamic/src/app/services/component-ref-provider.service.ts`
- `projects/runtime-base/src/services/dynamic-component-ref-provider.service.ts`
- `projects/components/base/src/widgets/common/base/partial-container.directive.ts`

### Build Configuration
- `build.sh`
- `config/rollup.wm-components.config.mjs`

### Test Files (50+ files)
- `projects/components/base/src/test/common-widget.specs.ts`
- All `*.wrapper.component.spec.ts` files
- Form, table, dialog spec files

## Status
- ✅ Code fixes complete
- ✅ Local build successful
- ✅ Verified working on wavemakeronline.com
- ⏳ Pending: Server deployment to proxy-studio.wmdev.com

