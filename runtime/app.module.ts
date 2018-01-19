import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { AppComponent } from './app.component';
import { PipeProvider } from './services/pipe-provider.service';
import { WmComponentsModule } from '@components/components.module';
import { PageUtils } from './services/page-utils.service';
import { PageWrapperComponent } from './components/page-wrapper.component';
import { HttpClientModule } from '@angular/common/http';

const routes = [
    {path: ':pageName', component: PageWrapperComponent, pathMatch: 'full'}
];

@NgModule({
    declarations: [
        AppComponent,
        PageWrapperComponent
    ],
    imports: [
        BrowserModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        WmComponentsModule,
        RouterModule,
        HttpClientModule,
        RouterModule.forRoot(routes, {useHash: true})
    ],
    providers: [PipeProvider, PageUtils],
    bootstrap: [AppComponent]
})
export class AppModule {
}