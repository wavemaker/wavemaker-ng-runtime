import { IBuildTaskDef, getAttrMarkup, register } from '@wm/transpiler';
import { Attribute, Element } from '@angular/compiler';

const tagName = 'div';
const colWidth = 'columnwidth';

const getAttr = (attrs: Array<Attribute>, name: string): Attribute => attrs.filter(attr => attr.name === name)[0];


// Todo - Vinay -- Move this logic to migration
register('wm-gridrow', (): IBuildTaskDef => {
    return {
        template: (node: Element) => {
            const gridCols = node.children;

            let availableWidth = 12;
            const gridColsWithoutColWidth: Array<Element> = [];

            gridCols.filter(el => (el as any).name === 'wm-gridcolumn')
                .forEach((gridCol: Element) => {
                    const widthAttr = getAttr(gridCol.attrs, colWidth);
                    if (widthAttr) {
                        availableWidth -= Number(widthAttr.value);
                    } else {
                        gridColsWithoutColWidth.push(gridCol);
                    }
                });

            if (gridColsWithoutColWidth.length) {
                const defaultWidth = parseInt(`${availableWidth / gridColsWithoutColWidth.length}`, 10);
                gridColsWithoutColWidth.forEach(gridCol => {
                    gridCol.attrs.push(new Attribute(colWidth, `${defaultWidth}`, <any>1, <any>1));
                });
            }
        },
        pre: attrs => `<${tagName} wmLayoutGridRow ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`
    };
});

export default () => {};