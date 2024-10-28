import { ComponentFactoryResolver, ElementRef, Injector, ViewContainerRef } from '@angular/core';
import { PartialContainerDirective } from './partial-container.directive';
import { App, ComponentType, PartialRefProvider } from '@wm/core';
import { Subject } from 'rxjs';

jest.mock('@wm/core', () => ({
    App: jest.fn(),
    $invokeWatchers: jest.fn(),
    noop: jest.fn(),
    ComponentType: { PARTIAL: 'PARTIAL' },
    PartialRefProvider: jest.fn()
}));

const $ = jest.fn().mockReturnValue({
    closest: jest.fn().mockReturnValue({
        length: 1,
        attr: jest.fn().mockReturnValue('TestPrefab')
    })
});
(global as any).$ = $;

describe('PartialContainerDirective', () => {
    let directive: PartialContainerDirective;
    let componentInstanceMock: any;
    let vcRefMock: jest.Mocked<ViewContainerRef>;
    let elRefMock: ElementRef;
    let injectorMock: jest.Mocked<Injector>;
    let appMock: jest.Mocked<App>;
    let resolverMock: jest.Mocked<ComponentFactoryResolver>;
    let partialRefProviderMock: jest.Mocked<PartialRefProvider>;
    let paramsSubject: Subject<any>;

    beforeEach(() => {
        paramsSubject = new Subject<any>();
        componentInstanceMock = {
            name: 'TestComponent',
            registerPropertyChangeListener: jest.fn(),
            registerDestroyListener: jest.fn(),
            invokeEventCallback: jest.fn(),
            params$: paramsSubject.asObservable(),
            content: 'test-content'
        };

        vcRefMock = {
            clear: jest.fn(),
            createComponent: jest.fn()
        } as unknown as jest.Mocked<ViewContainerRef>;

        elRefMock = {
            nativeElement: {
                querySelector: jest.fn(),
                appendChild: jest.fn()
            }
        } as unknown as ElementRef;

        injectorMock = { get: jest.fn() } as unknown as jest.Mocked<Injector>;
        appMock = { notify: jest.fn() } as unknown as jest.Mocked<App>;
        resolverMock = { resolveComponentFactory: jest.fn() } as unknown as jest.Mocked<ComponentFactoryResolver>;
        partialRefProviderMock = { getComponentFactoryRef: jest.fn() } as unknown as jest.Mocked<PartialRefProvider>;

        directive = new PartialContainerDirective(
            componentInstanceMock,
            vcRefMock,
            elRefMock,
            injectorMock,
            appMock,
            'test-content',
            resolverMock,
            partialRefProviderMock
        );
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should return the correct name', () => {
        expect(directive.name).toBe('TestComponent');
    });


    describe('_renderPartial', () => {
        beforeEach(() => {
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('should handle prefab scenarios', async () => {
            const componentFactoryMock = {};
            const componentRefMock = {
                instance: {},
                location: { nativeElement: document.createElement('div') }
            };

            partialRefProviderMock.getComponentFactoryRef.mockResolvedValue(componentFactoryMock);
            vcRefMock.createComponent.mockReturnValue(componentRefMock as any);

            await directive['_renderPartial']('new-content');

            expect($).toHaveBeenCalledWith(elRefMock.nativeElement);
            expect($().closest).toHaveBeenCalledWith('.app-prefab');
            expect($().closest().attr).toHaveBeenCalledWith('prefabname');
            expect(partialRefProviderMock.getComponentFactoryRef).toHaveBeenCalledWith('new-content', ComponentType.PARTIAL, { prefab: 'TestPrefab' });
        });

        it('should handle viewParent prefab scenario', async () => {
            $.mockReturnValueOnce({
                closest: jest.fn().mockReturnValue({
                    length: 0,  
                })
            });
            componentInstanceMock.viewParent = { prefabName: 'ParentPrefab' };

            const componentFactoryMock = {};
            const componentRefMock = {
                instance: {},
                location: { nativeElement: document.createElement('div') }
            };

            partialRefProviderMock.getComponentFactoryRef.mockResolvedValue(componentFactoryMock);
            vcRefMock.createComponent.mockReturnValue(componentRefMock as any);

            await directive['_renderPartial']('new-content');

            expect(partialRefProviderMock.getComponentFactoryRef).toHaveBeenCalledWith('new-content', ComponentType.PARTIAL, { prefab: 'ParentPrefab' });
        });


        it('should set prefabName on instanceRef if available', async () => {
            const componentFactoryMock = {};
            const componentRefMock = {
                instance: {},
                location: { nativeElement: document.createElement('div') }
            };

            partialRefProviderMock.getComponentFactoryRef.mockResolvedValue(componentFactoryMock);
            vcRefMock.createComponent.mockReturnValue(componentRefMock as any);

            await directive['_renderPartial']('new-content');

            expect((componentRefMock as any).instance.prefabName).toBe('TestPrefab');
        });

        it('should set $target to partial-container-target if available', async () => {
            const targetElement = document.createElement('div');
            (elRefMock.nativeElement.querySelector as jest.Mock).mockReturnValue(targetElement);

            const componentFactoryMock = {};
            const componentRefMock = {
                instance: {},
                location: { nativeElement: document.createElement('div') }
            };

            partialRefProviderMock.getComponentFactoryRef.mockResolvedValue(componentFactoryMock);
            vcRefMock.createComponent.mockReturnValue(componentRefMock as any);

            await directive['_renderPartial']('new-content');

            expect(elRefMock.nativeElement.querySelector).toHaveBeenCalledWith('[partial-container-target]');
            expect((directive as any).$target).toBe(targetElement);
        });

        it('should set $target to nativeElement if partial-container-target is not available', async () => {
            (elRefMock.nativeElement.querySelector as jest.Mock).mockReturnValue(null);

            const componentFactoryMock = {};
            const componentRefMock = {
                instance: {},
                location: { nativeElement: document.createElement('div') }
            };

            partialRefProviderMock.getComponentFactoryRef.mockResolvedValue(componentFactoryMock);
            vcRefMock.createComponent.mockReturnValue(componentRefMock as any);

            await directive['_renderPartial']('new-content');

            expect((directive as any).$target).toBe(elRefMock.nativeElement);
        });

        it('should set contentInitialized to true and call onLoadSuccess', async () => {
            const componentFactoryMock = {};
            const componentRefMock = {
                instance: {},
                location: { nativeElement: document.createElement('div') }
            };

            partialRefProviderMock.getComponentFactoryRef.mockResolvedValue(componentFactoryMock);
            vcRefMock.createComponent.mockReturnValue(componentRefMock as any);

            const onLoadSuccessSpy = jest.spyOn(directive as any, 'onLoadSuccess');

            await directive['_renderPartial']('new-content');

            expect((directive as any).contentInitialized).toBe(true);

            jest.advanceTimersByTime(200);
            expect(onLoadSuccessSpy).toHaveBeenCalled();
        });
    });

    describe('onLoadSuccess', () => {
        it('should invoke the load callback and notify app', () => {
            directive.onLoadSuccess();

            expect(componentInstanceMock.invokeEventCallback).toHaveBeenCalledWith('load');
            expect(appMock.notify).toHaveBeenCalledWith('partialLoaded');
        });
    });

    describe('constructor', () => {
        it('should register property change listener', () => {
            expect(componentInstanceMock.registerPropertyChangeListener).toHaveBeenCalled();
        });

        it('should call renderPartial when content property changes', () => {
            const renderPartialSpy = jest.spyOn(directive as any, 'renderPartial');
            const listener = componentInstanceMock.registerPropertyChangeListener.mock.calls[0][0];

            listener('content', 'new-content');

            expect(renderPartialSpy).toHaveBeenCalledWith('new-content');
        });

        it('should handle $lazyLoad when content property changes', () => {
            componentInstanceMock.$lazyLoad = jest.fn();
            const renderPartialSpy = jest.spyOn(directive as any, 'renderPartial');
            const listener = componentInstanceMock.registerPropertyChangeListener.mock.calls[0][0];

            listener('content', 'new-content');

            expect(componentInstanceMock.$lazyLoad).toBeInstanceOf(Function);
            componentInstanceMock.$lazyLoad();
            expect(renderPartialSpy).toHaveBeenCalledWith('new-content');
        });

        it('should subscribe to params$ and call renderPartial when contentInitialized', (done) => {
            const renderPartialSpy = jest.spyOn(directive as any, 'renderPartial');
            (directive as any).contentInitialized = true;

            // Simulate a delay to allow the subscription to be set up
            setTimeout(() => {
                paramsSubject.next({});

                // Allow time for debounceTime to complete
                setTimeout(() => {
                    expect(renderPartialSpy).toHaveBeenCalledWith(componentInstanceMock.content);
                    done();
                }, 250);
            }, 0);
        });

        it('should not call renderPartial when contentInitialized is false', (done) => {
            const renderPartialSpy = jest.spyOn(directive as any, 'renderPartial');
            (directive as any).contentInitialized = false;

            setTimeout(() => {
                paramsSubject.next({});

                setTimeout(() => {
                    expect(renderPartialSpy).not.toHaveBeenCalled();
                    done();
                }, 250);
            }, 0);
        });

        it('should register destroy listener that unsubscribes from params$', (done) => {
            expect(componentInstanceMock.registerDestroyListener).toHaveBeenCalled();
            const destroyListener = componentInstanceMock.registerDestroyListener.mock.calls[0][0];

            // Simulate contentInitialized to true to ensure subscription is created
            (directive as any).contentInitialized = true;

            // Trigger a params$ update to create the subscription
            setTimeout(() => {
                paramsSubject.next({});

                // Allow time for debounceTime to complete
                setTimeout(() => {
                    // Now call the destroy listener
                    destroyListener();

                    // Check if params$ subscription no longer triggers renderPartial
                    const renderPartialSpy = jest.spyOn(directive as any, 'renderPartial');
                    paramsSubject.next({});

                    // Allow time for potential debounceTime
                    setTimeout(() => {
                        expect(renderPartialSpy).not.toHaveBeenCalled();
                        done();
                    }, 250);
                }, 250);
            }, 0);
        });
    });
});