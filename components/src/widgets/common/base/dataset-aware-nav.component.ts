import { Injector, OnInit } from '@angular/core';
import { $appDigest, findValueOf, isObject, validateAccessRoles } from '@wm/core';

import { createArrayFrom } from '../../../utils/data-utils';
import { getEvaluatedData } from '../../../utils/widget-utils';
import { getOrderedDataSet } from '../../../utils/form-utils';
import { StylableComponent } from './stylable.component';

declare const _;

export class DatasetAwareNavComponent extends StylableComponent implements OnInit {

    public nodes: Array<NavNode> = [];
    public dataset: any;
    public itemicon: string;
    public itemlabel: string;
    public itemlink: string;
    public itembadge: string;
    public itemchildren: string;
    public itemaction: string;
    public itemclass: string;
    public itemid: string;
    public userrole: string;
    public orderby: string;
    public datafield: string;
    public displayfield: string;

    private _itemFieldMap;

    constructor(inj: Injector, WIDGET_CONFIG) {
        super(inj, WIDGET_CONFIG);
    }

    /**
     * constructs individual node for the widget model.
     * @param fields
     * @param node
     */
    private getNode(fields, node): NavNode {
        const children = getEvaluatedData(node, {expressionName: 'itemchildren'}) || node[fields.childrenField];
        return {
            action   : getEvaluatedData(node, {expressionName: 'itemaction'}) || node[fields.actionField],
            badge    : getEvaluatedData(node, {expressionName: 'itembadge'}) || node[fields.badgeField],
            children : Array.isArray(children) ? this.getNodes(children) : [],
            class    : node[fields.classField],
            disabled : node.disabled,
            icon     : getEvaluatedData(node, {expressionName: 'itemicon'}) || node[fields.iconField],
            id       : getEvaluatedData(node, {expressionName: 'itemid'}) || node[fields.idField],
            label    : getEvaluatedData(node, {expressionName: 'itemlink'}) || node[fields.labelField],
            link     : getEvaluatedData(node, {expressionName: 'itemlink'}) || node[fields.linkField],
            role     : getEvaluatedData(node, {expressionName: 'userrole'}),
            // older projects have display field & data field property for menu.
            value    : this.datafield ? (this.datafield === 'All Fields' ? node : findValueOf(node, this.datafield)) : node
        };
    }

    resetItemFieldMap() {
        this._itemFieldMap = null;
    }

    getItemFieldsMap() {
        if (!this._itemFieldMap) {
            this._itemFieldMap = {
                idField : this.itemid || 'itemid',
                iconField : this.itemicon || 'icon',
                labelField : this.itemlabel || 'label',
                linkField : this.itemlink || 'link',
                badgeField : this.itembadge || 'badge',
                childrenField : this.itemchildren || 'children',
                classField : this.itemclass || 'class',
                actionField : this.itemaction || 'action'
            };
        }
        return this._itemFieldMap;
    }

    /**
     * returns array for the value passed as nv.
     * nv: 'a,b' => [{label:a, value:a}, {label:b, value:b}]
     * nv: [1,2] => [{label:1, value:1}, {label:2, value:2}]
     * nv: [{obj}, {obj}] => [{obj}, {obj}]
     * @param nv
     */
    private prepareNodeDataSet(nv) {
        nv =  createArrayFrom(nv);
        return nv.map((val) => {
           if (!isObject(val)) {
                return {
                    label: val,
                    value: val
                };
           }
           return val;
        });
    }

    /**
     * constructs dataset form the nav elements.
     */
    private getNodes(nv = (this.dataset || {}).data || this.dataset): Array<NavNode> {
        let nodes: Array<any> = getOrderedDataSet(this.prepareNodeDataSet(nv), this.orderby) || [];

        if (nodes.length) {
            const userRole = this.userrole;
            const nodeFields = this.getItemFieldsMap();

            nodes = nodes.reduce((result, node) => {
                if (validateAccessRoles(node[userRole])) {
                    result.push(this.getNode(nodeFields, node));
                }
                return result;
            }, []);
        }
        return nodes;
    }

    // enable the inherited class to extend this method.
    protected resetNodes() {
        this.resetItemFieldMap();
        this.nodes = this.getNodes();
        $appDigest();
    }

    // debounce function for reset nodes functions.
    private _resetNodes = _.debounce(this.resetNodes, 50);

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'dataset':
            case 'itemicon':
            case 'itemlabel':
            case 'itemlink':
            case 'itemchildren':
            case 'orderby':
                // calls resetnodes method after 50ms. any calls within 50ms will be ignored.
                this._resetNodes();
                break;
        }
    }

    ngOnInit() {
        super.ngOnInit();
    }
}

export interface NavNode {
    label: string;
    action?: any;
    badge?: string;
    children?: Array<NavNode>;
    class?: string;
    disabled?: boolean;
    icon?: string;
    id?: string;
    link?: string;
    role?: string;
    value?: any;
}