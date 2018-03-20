import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { HomeComponent } from './components/home/home.component';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {path: '', component: HomeComponent},
            {path: 'audio', loadChildren: './components/audio/audio-demo.module#AudioDemoModule', pathMatch: 'full'},
            {path: 'button', loadChildren: './components/button/button-demo.module#ButtonDemoModule', pathMatch: 'full'},
            {path: 'anchor', loadChildren: './components/anchor/anchor-demo.module#AnchorDemoModule', pathMatch: 'full'},
            {path: 'icon', loadChildren: './components/icon/icon-demo.module#IconDemoModule', pathMatch: 'full'},
            {path: 'label', loadChildren: './components/label/label-demo.module#LabelDemoModule', pathMatch: 'full'},
            {path: 'picture', loadChildren: './components/picture/picture-demo.module#PictureDemoModule', pathMatch: 'full'},
            {path: 'text', loadChildren: './components/text/text-demo.module#TextDemoModule', pathMatch: 'full'},
            {path: 'select', loadChildren: './components/select/select-demo.module#SelectDemoModule', pathMatch: 'full'},
            {path: 'radioset', loadChildren: './components/radioset/radioset-demo.module#RadiosetDemoModule', pathMatch: 'full'},
            {path: 'switch', loadChildren: './components/switch/switch-demo.module#SwitchDemoModule', pathMatch: 'full'},
            {path: 'pagination', loadChildren: './components/pagination/pagination-demo.module#PaginationDemoModule', pathMatch: 'full'},
            {path: 'table', loadChildren: './components/table/table-demo.module#TableDemoModule'},
            {path: 'form', loadChildren: './components/form/form-demo.module#FormDemoModule'},
            {path: 'checkbox', loadChildren: './components/checkbox/checkbox-demo.module#CheckboxDemoModule', pathMatch: 'full'},
            {path: 'video', loadChildren: './components/video/video-demo.module#VideoDemoModule', pathMatch: 'full'},
            {path: 'html', loadChildren: './components/html/html-demo.module#HtmlDemoModule', pathMatch: 'full'},
            {path: 'message', loadChildren: './components/message/message-demo.module#MessageDemoModule', pathMatch: 'full'},
            {path: 'iframe', loadChildren: './components/iframe/iframe-demo.module#IframeDemoModule', pathMatch: 'full'},
            {path: 'spinner', loadChildren: './components/spinner/spinner-demo.module#SpinnerDemoModule', pathMatch: 'full'},
            {path: 'buttongroup', loadChildren: './components/buttongroup/buttongroup-demo.module#ButtongroupDemoModule', pathMatch: 'full'},
            {path: 'layoutgrid', loadChildren: './components/layoutgrid/layoutgrid-demo.module#LayoutgridDemoModule', pathMatch: 'full'},
            {path: 'textarea', loadChildren: './components/textarea/textarea-demo.module#TextareaDemoModule', pathMatch: 'full'},
            {path: 'date', loadChildren: './components/date/date-demo.module#DateDemoModule', pathMatch: 'full'},
            {path: 'time', loadChildren: './components/time/time-demo.module#TimeDemoModule', pathMatch: 'full'},
            {path: 'datetime', loadChildren: './components/datetime/datetime-demo.module#DatetimeDemoModule', pathMatch: 'full'},
            {path: 'calendar', loadChildren: './components/calendar/calendar-demo.module#CalendarDemoModule', pathMatch: 'full'},
            {path: 'dialog', loadChildren: './components/dialog/dialog-demo.module#DialogDemoModule', pathMatch: 'full'},
            {path: 'checkboxset', loadChildren: './components/checkboxset/checkboxset-demo.module#CheckboxsetDemoModule', pathMatch: 'full'},
            {path: 'rating', loadChildren: './components/rating/rating-demo.module#RatingDemoModule', pathMatch: 'full'},
            {path: 'search', loadChildren: './components/search/search-demo.module#SearchDemoModule', pathMatch: 'full'},
            {path: 'tabs', loadChildren: './components/tabs/tab-demo.module#TabDemoModule', pathMatch: 'full'},
            {path: 'colorpicker', loadChildren: './components/colorpicker/colorpicker-demo.module#ColorpickerDemoModule', pathMatch: 'full'},
            {path: 'currency', loadChildren: './components/currency/currency-demo.module#CurrencyDemoModule', pathMatch: 'full'},
            {path: 'tabs', loadChildren: './components/tabs/tab-demo.module#TabDemoModule', pathMatch: 'full'},
            {path: 'panel', loadChildren: './components/panel/panel-demo.module#PanelDemoModule', pathMatch: 'full'},
            {path: 'menu', loadChildren: './components/menu/menu-demo.module#MenuDemoModule', pathMatch: 'full'},
            {path: 'slider', loadChildren: './components/slider/slider-demo.module#SliderDemoModule', pathMatch: 'full'},
            {path: 'menu', loadChildren: './components/menu/menu-demo.module#MenuDemoModule', pathMatch: 'full'},
            {path: 'accordion', loadChildren: './components/accordion/accordion-demo.module#AccordionDemoModule', pathMatch: 'full'},
            {path: 'container', loadChildren: './components/container/container-demo.module#ContainerDemoModule', pathMatch: 'full'},
            {path: 'tile', loadChildren: './components/tile/tile-demo.module#TileDemoModule', pathMatch: 'full'},
            {path: 'toggle', loadChildren: './components/toggle/toggle-demo.module#ToggleDemoModule', pathMatch: 'full'},
            {path: 'progressbar', loadChildren: './components/progress-bar/progress-bar-demo.module#ProgressBarDemoModule', pathMatch: 'full'},
            {path: 'nav', loadChildren: './components/nav/nav-demo.module#NavDemoModule', pathMatch: 'full'}
        ])
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {}
