# AOT Compilation Migration Plan for Angular 20

## Current Architecture (JIT)

```
User navigates to page
  ↓
PageWrapperComponent.renderPage()
  ↓
ComponentRefProviderService.getComponentFactoryRef()
  ↓
Fetch page.min.json (markup, script, styles, variables)
  ↓
Transpile markup: <wm-page> → <div wmPage>
  ↓
Create dynamic component with @Component() decorator
  ↓
JIT compile with compiler.compileModuleAndAllComponentsSync()
  ↓
Create component instance
  ↓
❌ BROKEN IN ANGULAR 20: Directives not instantiated
```

## Proposed Architecture (AOT)

```
Build Time:
-----------
For each page.min.json:
  1. Read markup, script, styles, variables
  2. Transpile markup
  3. Generate .ts component file
  4. ng build compiles with AOT
  5. Output: Pre-compiled page components

Runtime:
--------
User navigates to page
  ↓
Angular Router lazy loads pre-compiled component
  ↓
✅ Component renders with ALL directives instantiated (AOT)
```

## Required Changes

### 1. Build System Changes

#### A. New Build Script: `generate-page-components.ts`
```typescript
// Reads all page.min.json files
// Transpiles markup
// Generates .ts component files
//
// Example output for Main page:
// src/app/pages/main/main-page.component.ts:
//
// @Component({
//   selector: 'app-page-main',
//   templateUrl: './main-page.component.html',
//   styleUrls: ['./main-page.component.css']
// })
// export class MainPageComponent extends BasePageComponent {
//   pageName = 'Main';
//   constructor(injector: Injector) {
//     super();
//     this.injector = injector;
//     super.init();
//   }
//   evalUserScript(instance, app, utils) {
//     // User's page.js script here
//   }
//   getVariables() {
//     return { /* page variables */ };
//   }
// }
```

#### B. Update `build.sh`
```bash
# Add before ng build:
node build-scripts/generate-page-components.js

# This scans:
# - src/main/webapp/pages/**/page.min.json
# - Generates: src/app/pages/**/*.component.ts
```

#### C. Update `angular.json`
```json
{
  "projects": {
    "wavemaker-ng-runtime": {
      "architect": {
        "build": {
          "options": {
            "aot": true,  // Enable AOT
            "buildOptimizer": true
          }
        }
      }
    }
  }
}
```

### 2. Runtime Changes

#### A. Update `app.routes.ts` - Lazy Loading
```typescript
// BEFORE (JIT):
export const routes: Routes = [
  { path: '', component: EmptyPageComponent },
  { path: ':pageName', component: PageWrapperComponent }
];

// AFTER (AOT):
export const routes: Routes = [
  { path: '', component: EmptyPageComponent },
  {
    path: 'Main',
    loadChildren: () => import('./pages/main/main-page.module').then(m => m.MainPageModule)
  },
  {
    path: 'Page2',
    loadChildren: () => import('./pages/page2/page2.module').then(m => m.Page2Module)
  }
  // ... generate route for each page
];
```

#### B. Remove JIT Compilation
```typescript
// DELETE: projects/runtime-dynamic/src/app/services/component-ref-provider.service.ts
// - getDynamicComponent()
// - getDynamicModule()
// - compiler.compileModuleAndAllComponentsSync()

// REPLACE WITH: Static component loader
export class ComponentRefProviderService {
  async getComponentFactoryRef(pageName, type) {
    // Return pre-compiled component factory
    // No more JIT compilation!
    const module = await import(`../pages/${pageName}/${pageName}.module`);
    return module.PageComponentFactory;
  }
}
```

#### C. Update PageWrapperComponent
```typescript
// BEFORE:
const factory = await this.componentRefProvider.getComponentFactoryRef(pageName, ComponentType.PAGE);
const componentRef = this.vcRef.createComponent(factory);

// AFTER:
const module = await import(`./pages/${pageName.toLowerCase()}/${pageName.toLowerCase()}-page.component`);
const component = module[`${pageName}PageComponent`];
const componentRef = this.vcRef.createComponent(component);
```

### 3. Generated Files Structure

```
src/app/pages/
├── main/
│   ├── main-page.component.ts     // Generated
│   ├── main-page.component.html   // Transpiled template
│   ├── main-page.component.css    // Page styles
│   └── main-page.module.ts        // Lazy load wrapper (optional)
├── employees/
│   ├── employees-page.component.ts
│   ├── employees-page.component.html
│   └── employees-page.component.css
...
```

### 4. Page Component Template (Generated)

**main-page.component.ts:**
```typescript
import { Component, Injector } from '@angular/core';
import { BasePageComponent } from '@wm/runtime/base';

@Component({
  selector: 'app-page-main',
  templateUrl: './main-page.component.html',
  styleUrls: ['./main-page.component.css'],
  standalone: true,
  imports: [
    // All directives used in template
    PageDirective,
    ContentComponent,
    PageContentComponent,
    ButtonComponent,
    LabelDirective,
    // ... auto-detected from template
  ]
})
export class MainPageComponent extends BasePageComponent {
  pageName = 'Main';
  
  constructor(injector: Injector) {
    super();
    this.injector = injector;
    super.init();
  }
  
  evalUserScript(instance: any, app: any, utils: any) {
    // Injected from page.js
    {{ PAGE_SCRIPT_HERE }}
  }
  
  getVariables() {
    return {{ PAGE_VARIABLES_HERE }};
  }
  
  getExpressions() {
    return {};
  }
}
```

**main-page.component.html** (Transpiled):
```html
<div wmPage #wm_page1="wmPage" data-role="pageContainer" [attr.aria-label]="wm_page1.arialabel" name="mainpage" pagetitle="Main">
  <header wmHeader partialContainer data-role="page-header" role="banner" content="header" name="header" height="auto"></header>
  <main wmContent data-role="page-content" role="main" name="content">
    <div wmPageContent wmSmoothscroll="false" name="mainContent">
      <!-- Page content widgets -->
    </div>
  </main>
</div>
```

## Implementation Steps

### Phase 1: Generator Script (1 week)
1. Create `build-scripts/generate-page-components.ts`
2. Implement page.min.json → .ts conversion
3. Handle transpilation
4. Auto-detect required imports
5. Generate route configurations

### Phase 2: Build Integration (3 days)
1. Update `build.sh` to run generator
2. Configure `angular.json` for AOT
3. Update package scripts

### Phase 3: Runtime Refactor (1 week)
1. Update component-ref-provider for static loading
2. Modify page-wrapper for pre-compiled components
3. Update routing for lazy loading
4. Handle partials and prefabs

### Phase 4: Testing (1 week)
1. Test all existing pages
2. Verify variable binding works
3. Check partial/prefab loading
4. Performance testing

## Pros and Cons

### AOT Pros:
✅ Fixes directive instantiation issue  
✅ Faster runtime performance  
✅ Smaller bundle size (no compiler in production)  
✅ Template errors caught at build time  
✅ Better tree-shaking  

### AOT Cons:
❌ 2-3 week development effort  
❌ Build time increases  
❌ Can't modify pages without rebuild  
❌ Preview mode more complex  
❌ Architectural change risk  

## Alternative: Keep JIT with Workarounds

If AOT migration is too risky, implement comprehensive directive initialization workaround:

1. **Post-compilation hook** that manually:
   - Adds directive classes
   - Sets widget properties from attributes
   - Initializes widget content
   - Attaches event handlers

2. **Estimated effort**: 1 week
3. **Risk**: Medium (workaround may break with Angular updates)
4. **Maintainability**: Low (technical debt)

## Recommendation

**Short-term**: Implement directive initialization workaround to unblock development  
**Long-term**: Plan AOT migration for next major release

The workaround will make the app functional but is technical debt. AOT is the proper solution but requires significant effort and planning.

