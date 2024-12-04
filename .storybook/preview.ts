import { moduleMetadata, type Preview } from "@storybook/angular";
import { themes } from '@storybook/theming';

import './initGlobalVariables';
import { FormsModule } from '@angular/forms';
import { IMaskModule } from 'angular-imask';
import { AbstractI18nService, App, AppDefaults, CustomPipeManager } from '@wm/core';

import { ToDatePipe, TrailingZeroDecimalPipe, ItemTemplateDirective, RepeatTemplateDirective } from "@wm/components/base";
import { CommonModule, DatePipe, DecimalPipe } from "@angular/common";
import X2JS from "x2js";

(<any>window).X2JS = X2JS;

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
      CommonModule, 
      FormsModule,
      IMaskModule
    ],
    providers: [
      ToDatePipe,
      TrailingZeroDecimalPipe,
      DecimalPipe,
      ItemTemplateDirective, RepeatTemplateDirective,
      DatePipe, // Provide the Angular DatePipe
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
