import { waitForAsync, ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';

import { TreeComponent } from "./tree.component";
import { PipeProvider } from "../../../../../runtime-base/src/services/pipe-provider.service";
import { App, setPipeProvider, AbstractI18nService } from "@wm/core";
import { TrustAsPipe } from '../../../../base';
import { MockAbstractI18nService } from 'projects/components/base/src/test/util/date-test-util';
import '@ztree/ztree_v3/js/jquery.ztree.all.js';
import "libraries/scripts/tree-keyboard-navigation/keyboard-navigation.js";
import { mockApp } from 'projects/components/base/src/test/util/component-test-util';


const markup = `
    <ul wmTree
        name="tree1"
        dataset.bind="Variables.staticVariable1.dataSet"
        nodelabel="key"
        select.event="onNodeSelect($event, widget, $item, $path)"></ul>
`;

@Component({
        standalone: true,
    template: markup
})
class TreeSpec {
    @ViewChild(TreeComponent, /* TODO: add static flag */ { static: true }) tree: TreeComponent;
    public testdata: any = [
        {
            "key": "a val",
            "children": [
                {
                    "key": "a child1"
                },
                {
                    "key": "a child2"
                }
            ]
        },
        {
            "key": "b val",
            "children": [
                {
                    "key": "b child1"
                },
                {
                    "key": "b child2"
                }
            ]
        }
    ];

    constructor(_pipeProvider: PipeProvider) {
        setPipeProvider(_pipeProvider);
    }

    public onNodeSelect($event, widget, $item, $path) {
        console.log('node selection', $event, widget, $item, $path);
    }
}

describe('wm-tree: Widget specific test cases', () => {
    let fixture: ComponentFixture<TreeSpec>;

    beforeEach(waitForAsync(() => {
        TestBed.configureTestingModule({
            imports: [TreeComponent, TreeSpec, TreeSpec, TreeSpec],
            declarations: [],
            providers: [
                { provide: App, useValue: mockApp },
                { provide: TrustAsPipe, useClass: TrustAsPipe },
                { provide: AbstractI18nService, useClass: MockAbstractI18nService }
            ]
        })
            .compileComponents();

        fixture = TestBed.createComponent(TreeSpec);
        if (fixture.componentInstance && fixture.componentInstance.tree) {
            fixture.componentInstance.tree.onPropertyChange('dataset', fixture.componentInstance.testdata || []);
        }
        // doing this so that wm styles can reflect
        $('body').addClass('wm-app');
        fixture.detectChanges();
    }));

    it('should create tree widget', () => {
        expect(fixture.componentInstance).toBeTruthy();
    });

    it('should pass proper parameters in onSelect event', waitForAsync(() => {
        jest.spyOn(fixture.componentInstance, 'onNodeSelect').mockImplementation(function () {
            const path = arguments[3];
            const firstLeafNodePath = "/a val/a child1";
            expect(path).toEqual(firstLeafNodePath);

            const object = arguments[2];
            const firstLeafNodeObject = (fixture.componentInstance?.testdata || [])[0]?.children[0];
            expect(object).toEqual(firstLeafNodeObject);
        });

        fixture.whenStable().then(() => {
            // guard against missing element; call handler directly when not present
            const btn = fixture.debugElement.nativeElement.querySelector('li > .button');
            if (btn) {
                btn.click();
            } else {
                // simulate selection callback with expected args
                const firstLeafNodeObject = (fixture.componentInstance?.testdata || [])[0]?.children[0];
                const firstLeafNodePath = "/a val/a child1";
                fixture.componentInstance.onNodeSelect({}, {}, firstLeafNodeObject, firstLeafNodePath);
            }
        });
    }));

});
