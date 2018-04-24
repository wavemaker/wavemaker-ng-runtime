import { Attribute, Directive, forwardRef, Injector } from '@angular/core';

import { $appDigest, $parseEvent, $parseExpr, getClonedObject } from '@wm/core';

import { IRedrawableComponent, WidgetRef } from '../../framework/types';
import { registerProps } from './tree.props';
import { getEvaluatedData, invokeEventHandler } from '../../../utils/widget-utils';
import { getOrderedDataSet } from '../../../utils/form-utils';
import { StylableComponent } from '../base/stylable.component';

const WIDGET_INFO = {widgetType: 'wm-tree', hostClass: 'app-tree'};

registerProps();

declare const _, $;

const defaultTreeIconClass = 'plus-minus';

const ICON_CLASSES = {
    'folder': {
        'expanded' : 'wi-folder-open',
        'collapsed': 'wi-folder'
    },
    'circle-plus-minus': {
        'expanded' : 'wi-remove-circle-outline',
        'collapsed': 'wi-add-circle-outline'
    },
    'chevron': {
        'expanded' : 'wi-keyboard-arrow-down',
        'collapsed': 'wi-keyboard-arrow-right'
    },
    'menu': {
        'expanded' : 'wi-arrow-down',
        'collapsed': 'wi-arrow-right'
    },
    'triangle': {
        'expanded' : 'wi-arrow-drop-down-circle',
        'collapsed': 'wi-play-circle-filled'
    },
    'expand-collapse': {
        'expanded' : 'wi-expand-less',
        'collapsed': 'wi-expand-more'
    },
    'plus-minus': {
        'expanded' : 'wi-minus',
        'collapsed': 'wi-plus'
    }
};

@Directive({
    selector: 'div[wmTree]',
    providers: [
        {provide: WidgetRef, useExisting: forwardRef(() => TreeDirective)}
    ]
})
export class TreeDirective extends StylableComponent implements IRedrawableComponent {
    datavalue: any;
    treeicons: string;
    nodeid: any;
    _selectNode: any;
    orderby: string;
    nodes: any;
    selecteditem: any | {};
    nodeaction: string;
    nodeclick: string;
    selecteddata: {};
    nodelabel: any;
    nodeicon;
    nodechildren;

    constructor(inj: Injector, @Attribute('datavalue.bind') private binddatavalue, @Attribute('nodeid.bind') private bindnodeid) {
        super(inj, WIDGET_INFO);
        this.bindEvents();
    }

    private constructNodes(nodes, parent, levels, deep, _evalDataValue) {

        let $ul           = $('<ul></ul>'),
            _iconClses    = ICON_CLASSES[this.treeicons || defaultTreeIconClass],
            _expr         = (this.binddatavalue || this.datavalue),
            _iconCls,
            _cls;

        _cls     = levels > 0 ? ' expanded ' : ' collapsed ';
        _iconCls = _cls + (levels > 0 ? _iconClses.expanded : _iconClses.collapsed);

        deep = deep || 0;

        parent.append($ul);
        nodes.forEach((node, idx) => {
            let $li             = $('<li></li>'),
                $iconNode       = $('<i></i>'),
                nodeLabel       = getEvaluatedData(node, {displayexpression: this.nodelabel}) || node.label,
                nodeIcon        = getEvaluatedData(node, {displayexpression: this.nodeicon}) || node.icon,
                nodeChildren    = getEvaluatedData(node, {displayexpression: this.nodechildren}) || node.children,
                nodeIdValue     = getEvaluatedData(node, {displayexpression: this.nodeid}),
                isNodeMatched   = false,
                expandCollapseIcon;

            $li.data('nodedata', node)
                .append($iconNode)
                .append('<span class="title">' + nodeLabel + '</span>')
                .appendTo($ul);


            // if datavalue(ie, expr) is provided select the tree node accordingly
            // if datavalue === 'FirstNode' -- select the FirstNode at level 0
            // if datavalue === 'LastNode' -- select the LastNode at level 0
            // if datavalue is a bind expression evaluate the expression for each node of the tree till the condition is satisfied.

            // if node identifier is present then verify the datavalue is bound expr or static value and compare with the node model
            if (this.bindnodeid || this.nodeid) {
                isNodeMatched = this.binddatavalue ? nodeIdValue == _evalDataValue : nodeIdValue == _expr;
                if (nodeIdValue) {
                    $li.attr('id', nodeIdValue);
                }
            } else if (this.binddatavalue) { // evaluate the expression only if it is bound (useExpression)
                isNodeMatched = !!$parseExpr(_expr)(this, node);
            }
            // Perform LastNode check only at level 0.(ie, deep = 0);
            if (!this._selectNode) {
                if ((_expr === 'FirstNode' && idx === 0)
                    || (!deep && _expr === 'LastNode' && idx === nodes.length - 1)
                    || isNodeMatched) {
                    // save a reference of the node to be selected in `_selectNode`
                    this._selectNode = $li;
                    this.datavalue   = nodeIdValue;
                }
            }

            if (nodeIcon) {
                $iconNode.addClass(nodeIcon);
            }

            if (nodeChildren && nodeChildren.length) { // parent node
                $li.addClass('parent-node ' + _cls);
                expandCollapseIcon = $('<i class="wi ' + _iconCls  + ' "></i>');
                if (nodeIcon) {
                    $iconNode.addClass(nodeIcon);
                }
                $li.prepend(expandCollapseIcon);
                this.constructNodes(nodeChildren, $li, levels - 1, deep + 1, _evalDataValue);
            } else {
                if (!nodeIcon) {
                    $iconNode.addClass('leaf-node');
                }
                $li.addClass('leaf-node');
            }
        });
    }

    private getNodesFromString(value) {
        return value.split(',').map(function (item) {
            return {
                'label': item && item.trim()
            };
        });
    }

    private getNodes(newVal) {
        let nodes;
        if (_.isString(newVal) && !_.isEmpty(newVal)) {
            newVal = newVal.trim();
            if (newVal) {
                nodes = this.getNodesFromString(newVal);
            }
        } else if (_.isArray(newVal)) {
            newVal = getOrderedDataSet(newVal, this.orderby);
            nodes = newVal;
        } else if (_.isObject(newVal)) {
            nodes = [newVal];
        }
        return nodes;
    }

    private changeTreeIcons(nv, ov) {
        const $el = $(this.nativeElement);
        nv = nv || defaultTreeIconClass;
        ov = ov || defaultTreeIconClass;
        $el.find('i.expanded').removeClass(ICON_CLASSES[ov].expanded).addClass(ICON_CLASSES[nv].expanded);
        $el.find('i.collapsed').removeClass(ICON_CLASSES[ov].collapsed).addClass(ICON_CLASSES[nv].collapsed);
    }

    private toggleExpandCollapseNode($event, $i, $li) {
        const treeIcons = ICON_CLASSES[this.treeicons || defaultTreeIconClass],
            eventParams = {
                '$event'  : $event
            };

        if ($i.hasClass('collapsed')) {
            $i.removeClass('collapsed ' + treeIcons.collapsed).addClass('expanded ' + treeIcons.expanded);
            $li.removeClass('collapsed').addClass('expanded');
            invokeEventHandler(this, 'expand', eventParams);
        } else if ($i.hasClass('expanded')) {
            $i.removeClass('expanded ' + treeIcons.expanded).addClass('collapsed ' + treeIcons.collapsed);
            $li.removeClass('expanded').addClass('collapsed');
            invokeEventHandler(this, 'collapse', eventParams);
        }
    }

    private _renderTree(forceRender?) {
        let levels = +this.nativeElement.getAttribute('levels') || 0,
            docFrag,
            $li,
            $liPath,
            data,
            path = '',
        $el = $(this.nativeElement);

        $el.empty();

        if (forceRender) {
            this._selectNode = undefined;
        }

        if (this.nodes && this.nodes.length) {
            docFrag = document.createDocumentFragment();
            this.constructNodes(this.nodes, $(docFrag), levels, 0, this.datavalue);
            $el.append(docFrag);
        }

        if (this._selectNode) {
            $li = this._selectNode;
            $li.addClass('selected');
            data    = $li.data('nodedata');
            $liPath = $li.parentsUntil($el, 'li.parent-node.collapsed');

            if (!$liPath.length) {
                $liPath = $li;
            }

            $liPath
                .each(() => {
                    let $current = $(this),
                        $i       = $current.children('i.collapsed'),
                        $title   = $current.children('.title');
                    this.toggleExpandCollapseNode(undefined, $i, $current);

                    path = '/' + $title.text() + path;
                });

            this.selecteditem = getClonedObject(data) || {};
            this.selecteditem.path = path;

            invokeEventHandler(this, 'select', {$event: undefined, $item: data, $path: path});
            $appDigest();
        }
    }

    onPropertyChange(key, nv, ov) {
        switch (key) {
            case 'dataset':
                this.nodes = this.getNodes(nv.data || nv);
                this._selectNode = undefined;
                this._renderTree();
                break;
            case 'nodeicon':
            case 'nodelabel':
            case 'nodechildren':
            case 'orderby':
                this._renderTree();
                break;
            case 'treeicons':
                this.changeTreeIcons(nv, ov);
                break;
            case 'datavalue':
                this.selectNodeById(nv);
                break;
        }
    }

    private selectNode(evt, value) {
        let target = evt && $(evt.target),
            $el = $(this.nativeElement),
            $li = _.isObject(value) ? value : $el.find('li[id="' + value + '"]:first'),
            data,
            path = '',
            $liPath,
            nodeAction;
        if (!$li.length) {
            return;
        }
        $el.find('.selected').removeClass('selected');
        $li.addClass('selected');
        data = $li.data('nodedata');
        nodeAction = data[this.nodeaction || 'action'];

        // if the selectNode is initiated by click event then use the nativeElement target from event
        $liPath = target ? target.parents('.app-tree li') : $li.find('> span.title').parents('.app-tree li');

        // construct the path of the node
        $liPath
            .each(function () {
                let current = $(this).children('.title').text();
                path = '/' + current + path;
            });

        // expand the current node till the viewParent level which is collapsed
        let that = this;
        $li.parentsUntil($el, 'li.viewParent-node.collapsed')
            .each(function () {
                let $current = $(this),
                    $i       = $current.children('i.collapsed');
                that.toggleExpandCollapseNode(undefined, $i, $current);
            });

        this.selecteditem      = getClonedObject(data) || {};
        this.selecteditem.path = path;

        if (target) {
            if (this.nodeid) {
                this.datavalue = $parseExpr(this.nodeid)(this, data);
            } else if (this.bindnodeid) {
                this.datavalue = getEvaluatedData(data, {expressionName: 'nodeid'});
            } else {
                this.datavalue = getClonedObject(data) || {};
            }
        }

        if (nodeAction) {
            $parseEvent(nodeAction)(this);
        }

        invokeEventHandler(this, 'select', {$event: evt, $item: data, $path: path});
        $appDigest();
    }
    // click event is added on the host nativeElement
    private bindEvents() {
        $(this.nativeElement).on('click', (evt) => {
            let target = $(evt.target),
                li     = target.closest('li'),
                $i     = target.is('i') ? target : target.siblings('i.collapsed,i.expanded');

            evt.stopPropagation();

            if (target.is('span.title')) { // select the node only if it is nodelabel
                this.selecteditem = {};
                this.selectNode(evt, li);
            }

            if (target.is('i') || (target.is('span.title') && this.nodeclick === 'expand')) {
                this.toggleExpandCollapseNode(evt, $i, li);
            }
        });
    }

    renderTree = _.debounce(this._renderTree, 20);

    redraw() {
        this._renderTree(true);
    }

    selectNodeById(value?) {
        this.selectNode(undefined, value);
    }

    deselectNode() {
        this.selecteddata = {};
        this.selectNodeById();
    }
}
