# Angular 20 JIT Compilation - Standalone Directive Instantiation Issue

## Problem Summary

After migrating to Angular 20.3.4, standalone directives are **NOT being instantiated** in dynamically JIT-compiled component templates.

## Technical Details

### What Works
✅ Transpiler converts `<wm-page>` to `<div wmPage #wm_page1="wmPage">`  
✅ Templates are compiled successfully  
✅ Components are created and rendered  
✅ Page initialization logic runs  

### What Doesn't Work
❌ PageDirective (selector: `[wmPage]`) constructor never called  
❌ Widget directives (ButtonDirective, LabelDirective, etc.) never instantiated  
❌ No classes added to elements (`app-page container` missing)  
❌ No widget-id attributes set  
❌ Widget content not rendered (buttons have `caption` attribute but no `textContent`)  

### Evidence

1. **Transpilation works:**
   ```javascript
   transpiler.transpile('<wm-page>...</wm-page>')
   // Returns: '<div wmPage #wm_page1="wmPage" data-role="pageContainer">...</div>'
   ```

2. **DOM shows transpiled markup:**
   ```html
   <div wmpage="" data-role="pageContainer" name="mainpage">
   ```

3. **But no directive instantiation:**
   - No `app-page container` classes
   - No `widget-id` attributes
   - Buttons have `caption="Button"` but `textContent=""` and `innerHTML=""`

### Code Configuration

**Dynamic Module Setup** (matches next-release):
```typescript
const getDynamicModule = (componentRef: any) => {
    return NgModule({
        declarations: [componentRef],
        imports: [
            ...REQUIRED_MODULES_FOR_DYNAMIC_COMPONENTS,  // Includes PageDirective, etc.
            CommonModule,
            FormsModule,
            ReactiveFormsModule,
            ...imports  // Includes PageDirective, ContentComponent, etc.
        ],
        providers: [...],
        schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
    })(class DynamicModule { });
};
```

**Compilation:**
```typescript
componentFactoryRef = this.compiler
    .compileModuleAndAllComponentsSync(moduleDef)
    .componentFactories
    .filter(factory => factory.componentType === componentDef)[0];
```

### Root Cause

Angular 20's `Compiler.compileModuleAndAllComponentsSync()` does NOT properly instantiate standalone directives that are imported into an NgModule when compiling dynamic templates at runtime.

This appears to be a **breaking change or regression in Angular 20** compared to Angular 18/19 where this pattern worked.

### Attempted Fixes (All Failed)

1. ❌ Made dynamic component standalone with explicit imports
2. ❌ Removed CUSTOM_ELEMENTS_SCHEMA  
3. ❌ Added exports to dynamic module
4. ❌ Used `compileModuleAsync` instead of `compileModuleAndAllComponentsSync`
5. ❌ Cleared compiler cache before compilation
6. ❌ Triggered `detectChanges()` after creation

### Impact

- Pages load but appear blank/broken
- No widget functionality  
- No proper styling
- Application unusable

### Required Solution

One of:
1. **Downgrade to Angular 18** (if 20 is not required)
2. **Switch to AOT compilation** (requires build-time template compilation, not runtime)
3. **Convert all standalone directives to module-based** (massive refactor, hundreds of files)
4. **Wait for Angular 20 patch** that fixes JIT + standalone directives
5. **Implement manual directive instantiation system** (complex workaround)

### Files Modified for Transpiler Fix

- `projects/runtime-dynamic/src/app/services/component-ref-provider.service.ts` - Added transpiler import
- `projects/components/transpile/ng-package.json` - Fixed output directory
- `projects/components/transpile/package.json` - Fixed package name  
- `config/rollup.wm-components.config.mjs` - Added transpiler bundle config
- `build.sh` - Added transpiler bundle to uglify list
- `projects/components/transpile/src/**/*.build.ts` - Fixed Element constructor calls

###  Current Status

**Transpiler Integration:** ✅ COMPLETE  
**Directive Instantiation:** ❌ BLOCKED by Angular 20 JIT limitation

The transpiler is working correctly. The remaining issue is a separate Angular 20 compatibility problem that requires either:
- An Angular framework fix
- A major architectural change to the application
- A comprehensive manual directive instantiation system

## Recommendation

Contact Angular team or check Angular 20.3.5+ release notes for JIT compilation fixes related to standalone components/directives.

