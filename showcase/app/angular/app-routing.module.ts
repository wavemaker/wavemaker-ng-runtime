import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {path: '', component: HomeComponent},
            {path: 'audio', loadChildren: './components/audio/audio-demo.module#AudioDemoModule'},
            {path: 'button', loadChildren: './components/button/button-demo.module#ButtonDemoModule'},
            {path: 'anchor', loadChildren: './components/anchor/anchor-demo.module#AnchorDemoModule'},
            {path: 'icon', loadChildren: './components/icon/icon-demo.module#IconDemoModule'},
            {path: 'label', loadChildren: './components/label/label-demo.module#LabelDemoModule'},
            {path: 'picture', loadChildren: './components/picture/picture-demo.module#PictureDemoModule'},
            {path: 'text', loadChildren: './components/text/text-demo.module#TextDemoModule'},
            {path: 'select', loadChildren: './components/select/select-demo.module#SelectDemoModule'},
            {path: 'radioset', loadChildren: './components/radioset/radioset-demo.module#RadiosetDemoModule'},
            {path: 'switch', loadChildren: './components/switch/switch-demo.module#SwitchDemoModule'},
            {path: 'pagination', loadChildren: './components/pagination/pagination-demo.module#PaginationDemoModule'},
            {path: 'checkbox', loadChildren: './components/checkbox/checkbox-demo.module#CheckboxDemoModule'},
            {path: 'video', loadChildren: './components/video/video-demo.module#VideoDemoModule'},
            {path: 'html', loadChildren: './components/html/html-demo.module#HtmlDemoModule'},
            {path: 'message', loadChildren: './components/message/message-demo.module#MessageDemoModule'},
            {path: 'iframe', loadChildren: './components/iframe/iframe-demo.module#IframeDemoModule'},
            {path: 'spinner', loadChildren: './components/spinner/spinner-demo.module#SpinnerDemoModule'},
            {path: 'buttongroup', loadChildren: './components/buttongroup/buttongroup-demo.module#ButtongroupDemoModule', pathMatch: 'full'},
            {path: 'layoutgrid', loadChildren: './components/layoutgrid/layoutgrid-demo.module#LayoutgridDemoModule', pathMatch: 'full'},
            {path: 'textarea', loadChildren: './components/textarea/textarea-demo.module#TextareaDemoModule', pathMatch: 'full'},
            {path: 'date', loadChildren: './components/date/date-demo.module#DateDemoModule', pathMatch: 'full'},
            {path: 'time', loadChildren: './components/time/time-demo.module#TimeDemoModule'},
            {path: 'datetime', loadChildren: './components/datetime/datetime-demo.module#DatetimeDemoModule'},
            {path: 'calendar', loadChildren: './components/calendar/calendar-demo.module#CalendarDemoModule'},
            {path: 'dialog', loadChildren: './components/dialog/dialog-demo.module#DialogDemoModule'},
            {path: 'checkboxset', loadChildren: './components/checkboxset/checkboxset-demo.module#CheckboxsetDemoModule', pathMatch: 'full'},
            {path: 'rating', loadChildren: './components/rating/rating-demo.module#RatingDemoModule', pathMatch: 'full'},
            {path: 'search', loadChildren: './components/search/search-demo.module#SearchDemoModule'},
            {path: 'tabs', loadChildren: './components/tabs/tab-demo.module#TabDemoModule', pathMatch: 'full'},
            {path: 'colorpicker', loadChildren: './components/colorpicker/colorpicker-demo.module#ColorpickerDemoModule', pathMatch: 'full'},
            {path: 'currency', loadChildren: './components/currency/currency-demo.module#CurrencyDemoModule', pathMatch: 'full'},
            {path: 'tabs', loadChildren: './components/tabs/tab-demo.module#TabDemoModule', pathMatch: 'full'},
            {path: 'panel', loadChildren: './components/panel/panel-demo.module#PanelDemoModule', pathMatch: 'full'},
            {path: 'menu', loadChildren: './components/menu/menu-demo.module#MenuDemoModule', pathMatch: 'full'},
            {path: 'slider', loadChildren: './components/slider/slider-demo.module#SliderDemoModule', pathMatch: 'full'},
            {path: 'menu', loadChildren: './components/menu/menu-demo.module#MenuDemoModule', pathMatch: 'full'},
            {path: 'accordion', loadChildren: './components/accordion/accordion-demo.module#AccordionDemoModule', pathMatch: 'full'},
            {path: 'container', loadChildren: './components/container/container-demo.module#ContainerDemoModule'},
            {path: 'tile', loadChildren: './components/tile/tile-demo.module#TileDemoModule'},
            {path: 'toggle', loadChildren: './components/toggle/toggle-demo.module#ToggleDemoModule'}
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
