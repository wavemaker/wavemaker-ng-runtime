import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './components/home/home.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { WmComponentsModule } from '@components/components.module';
import { PipeProvider } from '@runtime/services/pipe-provider.service';
import { ToastrModule } from 'ngx-toastr';

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        WmComponentsModule,
        ToastrModule.forRoot()
    ],
    providers: [PipeProvider],
    bootstrap: [AppComponent]
})
export class AppModule {
}
