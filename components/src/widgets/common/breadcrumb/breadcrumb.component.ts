import { Attribute, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';

import { getRouteNameFromLink, getUrlParams, openLink } from '@wm/core';

import { APPLY_STYLES_TYPE, styler } from '../../framework/styler';
import { registerProps } from './breadcrumb.props';
import { provideAsWidgetRef } from '../../../utils/widget-utils';
import { DatasetAwareNavComponent, NavNode } from '../base/dataset-aware-nav.component';

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
export class BreadcrumbComponent extends DatasetAwareNavComponent {

    private disableMenuContext: boolean;

    constructor(
        inj: Injector,
        private route: Router,
        private location: Location,
        @Attribute('beforenavigate.event') beforeNavigateCB: string
    ) {
        super(inj, WIDGET_CONFIG);
        styler(this.nativeElement, this, APPLY_STYLES_TYPE.CONTAINER);
        this.disableMenuContext = !!beforeNavigateCB;
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
        return this.location.path().substr(1).split('?')[0];
    }

    // over rides resetNode function, generating path for the breadcrumb.
    protected resetNodes() {
        super.resetNodes();
        // get path only if the widget have id property.
        if (this.itemid || this.binditemid) {
            this.nodes = this.getPath({key: this.getCurrentRoute(), isPathFound: false}, this.nodes);
        }

    }

    onItemClick ($event: Event, $item: any) {
        $event.preventDefault();
        const locals = {$item: $item.value, $event};
        const canNavigate = !(this.invokeEventCallback('beforenavigate', locals) === false);
        const linkTarget = $item.target;
        let itemLink = $item.link;

        if (itemLink && canNavigate) {
            if (itemLink.startsWith('#/') && (!linkTarget || linkTarget === '_self')) {
                const queryParams = getUrlParams(itemLink);
                itemLink = getRouteNameFromLink(itemLink);
                this.route.navigate([itemLink], { queryParams});
            } else {
                openLink(itemLink, linkTarget);
            }
        }
    }

}
