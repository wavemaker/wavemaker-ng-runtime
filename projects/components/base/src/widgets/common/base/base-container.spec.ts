import { ElementRef, Injector, QueryList } from '@angular/core';
import { BaseContainerComponent } from './base-container.component';
import { RedrawableDirective } from '../redraw/redrawable.directive';
import { StylableComponent } from './stylable.component';
import { IWidgetConfig } from '../../framework/types';
import { includes, pickBy } from 'lodash-es';
import { mockApp } from '../../../test/util/component-test-util';
import { App } from '@wm/core';

jest.mock('lodash-es', () => ({
    ...jest.requireActual('lodash-es'),
    includes: jest.fn(),
    pickBy: jest.fn(),
}));

describe('BaseContainerComponent', () => {
    let component: BaseContainerComponent;
    let injectorMock: Injector;
    let redrawableDirectiveMock: RedrawableDirective;
    let reDrawableComponentsMock: QueryList<RedrawableDirective>;
    let widgetConfigMock: IWidgetConfig;
    let elementRefMock: ElementRef;
    let nativeElementMock: any;

    // Subclass to create a concrete class for testing
    class TestContainerComponent extends BaseContainerComponent {
        constructor(injector: Injector, widgetConfig: IWidgetConfig, explicitContext?: any) {
            super(injector, { widgetType: 'wm-form-field-datetime' }, explicitContext);
        }
    }

    beforeEach(() => {
        nativeElementMock = document.createElement('div');
        elementRefMock = { nativeElement: nativeElementMock } as ElementRef;

        injectorMock = {
            get: jest.fn().mockImplementation((token) => {
                if (token === ElementRef) return elementRefMock;

                if (token === App) return mockApp

                return null;
            }),
            _lView: [null, null, null, null, null, null, null, null, { index: 0 }],
            _tNode: {
                attrs: ['attr1', 'value1', 'attr2', 'value2']
            }
        } as any;
        widgetConfigMock = {
            widgetType: 'wm-container',
            hostClass: 'app-container',
        } as IWidgetConfig;

        redrawableDirectiveMock = {
            redraw: jest.fn(),
        } as any as RedrawableDirective;

        reDrawableComponentsMock = {
            _results: [],
            forEach: jest.fn().mockImplementation((cb) => {
                cb(redrawableDirectiveMock);
            }),
        } as any as QueryList<RedrawableDirective>;

        component = new TestContainerComponent(injectorMock, widgetConfigMock);
        component.reDrawableComponents = reDrawableComponentsMock;
        component.Widgets = {
            widget1: { nativeElement: { hasAttribute: jest.fn().mockReturnValue(true) } },
        };
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('constructor', () => {
        it('should initialize the component with proper injector and config', () => {
            expect(component).toBeTruthy();
            expect(component instanceof StylableComponent).toBe(true);
        });
    });

    describe('onPropertyChange', () => {
        it('should call redrawChildren when show property changes to true', () => {
            const redrawChildrenSpy = jest.spyOn((component as any), 'redrawChildren');
            component && component.onPropertyChange('show', true);

            // Assert
            expect(redrawChildrenSpy).toHaveBeenCalled();
        });

        it('should not call redrawChildren when show property is false', () => {
            const redrawChildrenSpy = jest.spyOn((component as any), 'redrawChildren');
            component && component.onPropertyChange('show', false);

            // Assert
            expect(redrawChildrenSpy).not.toHaveBeenCalled();
        });

    });

    describe('updateRedrawableComponents', () => {
        it('should add redrawable widgets to reDrawableComponents', () => {
            const widgets = {
                widget1: { nativeElement: { hasAttribute: jest.fn().mockReturnValue(true) } },
                widget2: { nativeElement: { hasAttribute: jest.fn().mockReturnValue(false) } },
                widget3: {
                    nativeElement: { hasAttribute: jest.fn().mockReturnValue(true) },
                    Widgets: {
                        nestedWidget: { nativeElement: { hasAttribute: jest.fn().mockReturnValue(true) } }
                    }
                }
            };

            (includes as jest.Mock).mockReturnValue(false);
            (pickBy as jest.Mock).mockImplementation((obj, predicate) => {
                const result = {};
                Object.keys(obj).forEach(key => {
                    if (predicate(obj[key])) {
                        result[key] = obj[key];
                    }
                });
                return result;
            });

            (component as any).updateRedrawableComponents(widgets);

            expect(component.reDrawableComponents._results).toContain(widgets.widget1);
            expect(component.reDrawableComponents._results).not.toContain(widgets.widget2);
            expect(component.reDrawableComponents._results).toContain(widgets.widget3);
            expect(component.reDrawableComponents._results).toContain(widgets.widget3.Widgets.nestedWidget);
        });
    });

    describe('redrawChildren', () => {
        it('should update reDrawableComponents and call redraw on each component', (done) => {
            component.content = {};
            component.Widgets = {
                widget1: { nativeElement: { hasAttribute: jest.fn().mockReturnValue(true) } }
            };

            const updateRedrawableComponentsSpy = jest.spyOn(component as any, 'updateRedrawableComponents');

            (component as any).redrawChildren();

            setTimeout(() => {
                expect(updateRedrawableComponentsSpy).toHaveBeenCalledWith(component.Widgets);
                expect(component.reDrawableComponents.forEach).toHaveBeenCalled();
                expect(redrawableDirectiveMock.redraw).toHaveBeenCalled();
                done();
            }, 150);
        });

        it('should not update reDrawableComponents if content or Widgets are not defined', (done) => {
            component.content = undefined;
            component.Widgets = undefined;

            const updateRedrawableComponentsSpy = jest.spyOn(component as any, 'updateRedrawableComponents');

            (component as any).redrawChildren();

            setTimeout(() => {
                expect(updateRedrawableComponentsSpy).not.toHaveBeenCalled();
                expect(component.reDrawableComponents.forEach).toHaveBeenCalled();
                expect(redrawableDirectiveMock.redraw).toHaveBeenCalled();
                done();
            }, 150);
        });
    });
});
