import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent} from './app.component';

import { PipeProvider } from './services/pipe-provider';

import { WmComponentsModule } from '@components/components.module';

const routes = [];

 
@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    WmComponentsModule,
    RouterModule,
    RouterModule.forRoot(routes, {useHash: true})
  ],
  providers: [PipeProvider],
  bootstrap: [AppComponent] 
})
export class AppModule { }