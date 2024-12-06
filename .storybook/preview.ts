import { moduleMetadata, type Preview } from "@storybook/angular";
import { themes } from '@storybook/theming';
import './initGlobalVariables';
import { FormsModule } from '@angular/forms';
import { IMaskModule } from 'angular-imask';
import { AbstractI18nService, App, AppDefaults, CustomPipeManager } from '@wm/core';
import { ToDatePipe, TrailingZeroDecimalPipe, ItemTemplateDirective, RepeatTemplateDirective, ImagePipe } from "@wm/components/base";
import {ColorPickerDirective} from 'ngx-color-picker';
import { WmComponentsModule } from '@wm/components/base';

//ngx-modules
import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { TimepickerModule as ngxTimepickerModule } from 'ngx-bootstrap/timepicker';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { PaginationModule as ngxPaginationModule } from 'ngx-bootstrap/pagination';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule as ngxPopoverModule } from 'ngx-bootstrap/popover';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { ToastNoAnimationModule } from 'ngx-toastr';
import { CarouselModule as ngxCarouselModule, } from 'ngx-bootstrap/carousel';
import { ColorPickerModule } from 'ngx-color-picker';

//wm-modules
import { BasicModule } from '@wm/components/basic';
import { ProgressModule } from '@wm/components/basic/progress';
import { RichTextEditorModule } from '@wm/components/basic/rich-text-editor';
import { SearchModule } from '@wm/components/basic/search';
import { TreeModule } from '@wm/components/basic/tree';

// input
import { InputModule } from '@wm/components/input';
import { CalendarModule } from '@wm/components/input/calendar';
import { ChipsModule } from '@wm/components/input/chips';
//import { ColorPickerModule } from '@wm/components/input/color-picker';
import { CurrencyModule } from '@wm/components/input/currency';
import { EpochModule } from '@wm/components/input/epoch';
import { FileUploadModule } from '@wm/components/input/file-upload';
import { RatingModule } from '@wm/components/input/rating';
import { SliderModule } from '@wm/components/input/slider';

// Data
import { CardModule } from '@wm/components/data/card';
import { FormModule } from '@wm/components/data/form';
import { ListModule } from '@wm/components/data/list';
import { LiveTableModule } from '@wm/components/data/live-table';
import { PaginationModule } from '@wm/components/data/pagination';
import { TableModule } from '@wm/components/data/table';

// Chart
import { ChartModule } from '@wm/components/chart';

// Containers
import { AccordionModule } from '@wm/components/containers/accordion';
import { LinearLayoutModule } from '@wm/components/containers/linear-layout';
import { LayoutGridModule } from '@wm/components/containers/layout-grid';
import { PanelModule } from '@wm/components/containers/panel';
import { TabsModule } from '@wm/components/containers/tabs';
import { TileModule } from '@wm/components/containers/tile';
import { WizardModule } from '@wm/components/containers/wizard';

// Dialogs
import { AlertDialogModule } from '@wm/components/dialogs/alert-dialog';
import { IframeDialogModule } from '@wm/components/dialogs/iframe-dialog';
import { LoginDialogModule } from '@wm/components/dialogs/login-dialog';
import { PartialDialogModule } from '@wm/components/dialogs/partial-dialog';

// Navigation
import { BreadcrumbModule } from '@wm/components/navigation/breadcrumb';
import { MenuModule } from '@wm/components/navigation/menu';
import { NavbarModule } from '@wm/components/navigation/navbar';
import { PopoverModule } from '@wm/components/navigation/popover';

// Advanced
import { CarouselModule } from '@wm/components/advanced/carousel';
import { LoginModule } from '@wm/components/advanced/login';
import { MarqueeModule } from '@wm/components/advanced/marquee';
import { CustomModule } from '@wm/components/advanced/custom';

import { PageModule } from '@wm/components/page';
import { FooterModule } from '@wm/components/page/footer';
import { HeaderModule } from '@wm/components/page/header';
import { LeftPanelModule } from '@wm/components/page/left-panel';
import { RightPanelModule } from '@wm/components/page/right-panel';
import { TopNavModule } from '@wm/components/page/top-nav';

import { PrefabModule } from '@wm/components/prefab';

import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import X2JS from "x2js";

(<any>window).X2JS = X2JS;

export const toastrModule = ToastNoAnimationModule.forRoot({ maxOpened: 1, autoDismiss: true });

const componentsModule = [
  //WmComponentsModule,

  // NGX Bootstrap
  BsDatepickerModule,
  ngxTimepickerModule,
  BsDropdownModule,
  ngxPaginationModule,
  TypeaheadModule,
  ProgressbarModule,
  ngxCarouselModule,
  ngxPopoverModule,
  NgCircleProgressModule,
  TooltipModule,
  ModalModule,
  toastrModule,

  // Basic widgets
  BasicModule,
  ProgressModule,
  RichTextEditorModule,
  SearchModule,
  TreeModule,

  // Input
  CalendarModule,
  ChipsModule,
  ColorPickerModule,
  CurrencyModule,
  EpochModule,
  FileUploadModule,
  // InputModule,
  RatingModule,
  SliderModule,

  // Data
  CardModule,
  FormModule,
  ListModule,
  LiveTableModule,
  PaginationModule,
  TableModule,

  // chart
  ChartModule,

  // container modules
  AccordionModule,
  LinearLayoutModule,
  LayoutGridModule,
  PanelModule,
  TabsModule,
  TileModule,
  WizardModule,

  // dialogs
  AlertDialogModule,
  IframeDialogModule,
  LoginDialogModule,
  PartialDialogModule,

  // navigation
  BreadcrumbModule,
  MenuModule,
  NavbarModule,
  PopoverModule,

  // Advanced
  CarouselModule,
  LoginModule,
  MarqueeModule,
  CustomModule,

  PageModule,
  FooterModule,
  HeaderModule,
  LeftPanelModule,
  RightPanelModule,
  TopNavModule,

  PrefabModule
];

// Provide a concrete implementation for the abstract class
class MockApp extends App {
   // Override the subscribe function property in the derived class
   subscribe = (eventName: any, callback: (data: any) => void): () => void => {
    console.log('Concrete subscribe:', eventName);
    
    // Call the base class implementation and return the function it returns
    // const baseCallback = super.subscribe(eventName, callback);
    
    // Return the function from the base class or modify it
    return () => {
      console.log('Additional logic before callback');
      // baseCallback(); // Optionally call the function returned by the base class
    };
  };
}

class MockAppDefault extends AppDefaults {
  setFormats(formats) {

  }
}

// Mock or real implementations of the services
class MockI18nService {
  // Add mocked methods as needed
  getSelectedLocale(){
    return "en-US"
  }

  getwidgetLocale(){
    return "";  //can be {'timezone': '', 'number': ''};
  }

  public initCalendarLocale(): Promise<any> {
    return Promise.resolve();
}

}

class MockCustomPipeManager {
  getCustomPipe(key) {}
  // Add mocked methods as needed
}

import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'toDate' })
class MockToDatePipe implements PipeTransform {
  transform(value: any): any {
    return 'Mocked Date';
  }
}

export const decorators = [
  moduleMetadata({
    declarations: [], // Add any declarations your components depend on
    imports: [
      ...componentsModule,
      CommonModule, 
      FormsModule,
      IMaskModule
    ],
    providers: [
      ToDatePipe,
      TrailingZeroDecimalPipe,
      DecimalPipe,
      ItemTemplateDirective, RepeatTemplateDirective, ColorPickerDirective,
      DatePipe, // Provide the Angular DatePipe,
      ImagePipe,
      { provide: AbstractI18nService, useClass: MockI18nService }, // Mocked or real implementation
      { provide: CustomPipeManager, useClass: MockCustomPipeManager }, // Mocked or real implementation
      { provide: App, useClass: MockApp },
      { provide: AppDefaults, useClass: MockAppDefault },
      // {provide: , useClass: MockToDatePipe},
      {
        provide: 'UNDEFINED_PROVIDER',
        useValue: (dependency: any) => {
          console.warn(`Request for unregistered dependency: ${dependency}`);
        },
      },
      // Add any providers your components depend on
    ],
  }),
];

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
      docs: {
        theme: themes.normal,
      },
    },
    actions: { argTypesRegex: "^on[A-Z].*" }
  },
};
export default preview;
