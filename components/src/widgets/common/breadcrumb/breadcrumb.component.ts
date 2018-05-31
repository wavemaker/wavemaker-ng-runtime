import { AfterViewInit, Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './breadcrumb.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent, NavNode } from '../base/dataset-aware-nav.component';
import { $appDigest } from '@wm/core';

registerProps();

const DEFAULT_CLS = 'breadcrumb app-breadcrumb';
const WIDGET_CONFIG = {widgetType: 'wm-breadcrumb', hostClass: DEFAULT_CLS};

declare const _;

@Component({
    selector: '[wmBreadcrumb]',
    templateUrl: './breadcrumb.component.html',
    providers: [
        provideAsWidgetRef(BreadcrumbComponent)
    ]
})
export class BreadcrumbComponent extends DatasetAwareNavComponent implements AfterViewInit, OnInit {

    constructor(
        inj: Injector,
        private route: Router,
        private location: Location
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
    }

    /**
     * Gets the first path found based on the key provided inside info Object.
     * @param info - Info object which has properties key(Active Page Name) and isPathFound[boolean] is set true if path found.
     * @param children - a child Object form children Array.
     * @param path - final path.
     * @returns {*|Array}: returns array of objects which represents the final path.
     */
    private getPath(info: {key: string, isPathFound: boolean}, children: Array<NavNode>, path = []): Array<NavNode> {
        children.forEach((child: NavNode) => {
            // return if path already found.
            if (info.isPathFound) {
                return path;
            }
            // if key is matched set path found to true and return the path.
            if (child.id === info.key) {
                info.isPathFound = true;
                // only push the child object by omiting the children within it.
                path.push(child);
                return path;
            }
            // if the node has children make a recursive call.
            if (child.children.length) {
                path.push(child);
                this.getPath(info, child.children, path);
                // if path is not found in that node pop the node.
                if (!info.isPathFound) {
                    path.pop();
                }
            }
        });
        // return the path.
        return path;
    }

    private getCurrentRoute(): string {
        return this.location.path().substr(1);
    }

    // over rides resetNode function, generating path for the breadcrumb.
    protected resetNodes() {
        super.resetNodes();
        // get path only if the widget have id property.
        if (this.itemid) {
            this.nodes = this.getPath({key: this.getCurrentRoute(), isPathFound: false}, this.nodes);
            $appDigest();
        }

    }

    onPropertyChange(key, nv, ov) {
        super.onPropertyChange(key, nv, ov);
    }

    onItemClick ($item) {
        let link = $item.link || '';
        const canNavigate = !(this.invokeEventCallback('beforenavigate', {$item}) === false);
        const params = {};

        if (link && canNavigate) {
            /* removing spl characters from the beginning of the path.
               1. #/Main  -> Main
               2. .#/Main/abc -> Main/abc
            */
            link = _.first(link.match(/[\w]+.*/g));

            // If url params are present, construct params object and pass it to search
            const index = link.indexOf('?');
            if (index !== -1) {
                const queryParams = _.split(link.substring(index + 1, link.length), '&');
                link = link.substring(0, index);
                queryParams.forEach((param) => {
                    param = _.split(param, '=');
                    params[param[0]] = param[1];
                });
            }
            // search method is passed with empty object to remove url parameters.
            // TODO: navigate to the link. using angular route
            window.location.href = link;
        }
    }

    ngOnInit() {
        super.ngOnInit();
    }

    ngAfterViewInit() {
        super.ngAfterViewInit();
    }
}
