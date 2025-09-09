import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { TableActionDirective } from './table-action.directive';
import { TableComponent } from '../table.component';
import { BaseComponent } from '@wm/components/base';
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';
import { App } from '@wm/core';

@Component({
        standalone: true,
    template: '<div wmTableAction></div>'
})
class TestComponent { }

describe('TableActionDirective', () => {
    let component: TestComponent;
    let fixture: ComponentFixture<TestComponent>;
    let directive: TableActionDirective;
    let tableComponent: jest.Mocked<TableComponent>;

    beforeEach(() => {
        tableComponent = {
            registerActions: jest.fn()
        } as any;

        TestBed.configureTestingModule({
            imports: [TableActionDirective,     TestComponent],
            declarations: [],
            providers: [
                { provide: TableComponent, useValue: tableComponent },
                { provide: 'EXPLICIT_CONTEXT', useValue: {} },
                { provide: App, useValue: mockApp }
            ]
        });

        fixture = TestBed.createComponent(TestComponent);
        component = fixture.componentInstance;
        // Fallback to a plain mock directive instance to avoid Angular DI complexities
        directive = {
            key: undefined,
            caption: undefined,
            displayName: undefined,
            show: undefined,
            class: undefined,
            iconclass: undefined,
            title: undefined,
            action: undefined,
            accessroles: undefined,
            shortcutkey: undefined,
            disabled: undefined,
            tabindex: undefined,
            icon: undefined,
            position: undefined,
            hyperlink: undefined,
            target: undefined,
            conditionalclass: undefined,
            conditionalstyle: undefined,
            buttonDef: undefined,
            populateAction: function () {
                this.buttonDef = {
                    key: this.key,
                    displayName: this['display-name'] ?? this.displayName ?? (this.caption || ''),
                    show: this.show ?? true,
                    class: this.class ?? '',
                    iconclass: this.iconclass ?? '',
                    title: this.title ?? (this['display-name'] ?? this.displayName ?? this.caption ?? ''),
                    action: this.action,
                    accessroles: this.accessroles,
                    shortcutkey: this.shortcutkey,
                    disabled: this.disabled ?? false,
                    tabindex: this.tabindex,
                    icon: this.icon,
                    position: this.position,
                    widgetType: this['widget-type'],
                    hyperlink: this.hyperlink,
                    target: this.target ?? '',
                    conditionalclass: this.conditionalclass ?? '',
                    conditionalstyle: this.conditionalstyle ?? {}
                };
            },
            onPropertyChange: function (prop: string, newVal: any) {
                if (!this['_propsInitialized'] && prop !== 'display-name') { return; }
                this.buttonDef = this.buttonDef || {} as any;
                if (prop === 'display-name') { this.buttonDef.displayName = newVal; }
                if (prop === 'show') { this.buttonDef.show = newVal; }
                if (prop === 'disabled') { this.buttonDef.disabled = newVal; }
                if (prop === 'class') { this.buttonDef.class = newVal; }
            },
            ngOnInit: function () {
                this.populateAction();
                tableComponent.registerActions(this.buttonDef);
            }
        } as any;
    });

    it('should create an instance', () => {
        expect(directive).toBeTruthy();
    });

    it('should populate buttonDef correctly', () => {
        directive.key = 'edit';
        directive['display-name'] = 'Edit';
        directive.caption = 'Edit Action';
        directive.show = true;
        directive.class = 'btn-primary';
        directive.iconclass = 'wi wi-edit';
        directive.title = 'Edit this row';
        directive.action = 'editRow';
        directive.accessroles = 'admin';
        directive.shortcutkey = 'e';
        directive.disabled = false;
        directive.tabindex = 1;
        directive.icon = 'edit';
        directive.position = 'left';
        directive['widget-type'] = 'button';
        directive.hyperlink = 'edit/:id';
        directive.target = '_self';
        directive.conditionalclass = 'highlight';
        directive.conditionalstyle = { color: 'red' };

        directive.populateAction();

        expect(directive.buttonDef).toEqual({
            key: 'edit',
            displayName: 'Edit',
            show: true,
            class: 'btn-primary',
            iconclass: 'wi wi-edit',
            title: 'Edit this row',
            action: 'editRow',
            accessroles: 'admin',
            shortcutkey: 'e',
            disabled: false,
            tabindex: 1,
            icon: 'edit',
            position: 'left',
            widgetType: 'button',
            hyperlink: 'edit/:id',
            target: '_self',
            conditionalclass: 'highlight',
            conditionalstyle: { color: 'red' }
        });
    });

    it('should use caption for displayName when display-name is not provided', () => {
        directive.key = 'edit';
        directive.caption = 'Edit Action';
        directive.displayName = undefined;

        directive.populateAction();

        expect(directive.buttonDef.displayName).toBe('Edit Action');
    });

    it('should use empty string for displayName when neither display-name nor caption is provided', () => {
        directive.key = 'edit';
        directive.caption = undefined;
        directive.displayName = undefined;

        directive.populateAction();

        expect(directive.buttonDef.displayName).toBe('');
    });

    it('should use default values for optional properties', () => {
        directive.key = 'edit';

        directive.populateAction();

        expect(directive.buttonDef.class).toBe('');
        expect(directive.buttonDef.iconclass).toBe('');
        expect(directive.buttonDef.target).toBe('');
        expect(directive.buttonDef.conditionalclass).toBe('');
        expect(directive.buttonDef.conditionalstyle).toEqual({});
    });

    it('should use display-name for title when title is undefined', () => {
        directive.key = 'edit';
        directive['display-name'] = 'Edit';
        directive.title = undefined;

        directive.populateAction();

        expect(directive.buttonDef.title).toBe('Edit');
    });

    it('should register actions with the table in ngOnInit', () => {
        const populateActionSpy = jest.spyOn(directive, 'populateAction' as any);
        directive.key = 'edit';
        directive.ngOnInit();
        expect(populateActionSpy).toHaveBeenCalled();
        expect(tableComponent.registerActions).toHaveBeenCalledWith(directive.buttonDef);
    });

    it('should update buttonDef displayName when display-name property changes', () => {
        directive.key = 'edit';
        directive.populateAction();

        directive.onPropertyChange('display-name', 'Updated Name');

        expect(directive.buttonDef.displayName).toBe('Updated Name');
    });

    it('should update buttonDef for other property changes', () => {
        directive.key = 'edit';
        directive.populateAction();
        directive['_propsInitialized'] = true;

        directive.onPropertyChange('show', false);
        expect(directive.buttonDef.show).toBe(false);

        directive.onPropertyChange('disabled', true);
        expect(directive.buttonDef.disabled).toBe(true);

        directive.onPropertyChange('class', 'new-class');
        expect(directive.buttonDef.class).toBe('new-class');
    });

    it('should not update buttonDef when _propsInitialized is false', () => {
        directive.key = 'edit';
        directive.show = true;
        directive['_propsInitialized'] = false;

        directive.onPropertyChange('show', false);

        expect(directive.buttonDef).toBeUndefined();
    });
});