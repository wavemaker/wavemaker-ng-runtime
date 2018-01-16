import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AccordionDemoComponent } from './accordion-demo.component';

const routes: Routes = [{path: '', component: AccordionDemoComponent}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccordionDemoRoutingModule { }
