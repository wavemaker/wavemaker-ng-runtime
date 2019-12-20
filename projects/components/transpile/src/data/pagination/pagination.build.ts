import { getAttrMarkup, IBuildTaskDef, register } from '@wm/transpiler';

const tagName = 'nav';

register('wm-pagination', (): IBuildTaskDef => {
    return {
        pre: attrs => `<${tagName} wmPagination data-identifier="pagination" aria-label="Page navigation" ${getAttrMarkup(attrs)}>`,
        post: () => `</${tagName}>`,
        imports: [{
            from: '@angular/forms',
            name: 'FormsModule',
            as: 'ngFormsModule'
        },{
            from: 'ngx-bootstrap/pagination',
            name: 'PaginationModule',
            as: 'ngxPaginationModule',
            forRoot: true
        },{
            from: '@wm/components/data/pagination',
            name: 'PaginationModule'
        }]
    };
});

export default () => {};
