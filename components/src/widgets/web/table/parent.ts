import { forwardRef } from '@angular/core';

export abstract class TableParent {
    abstract headerConfig;

    abstract registerColumns(tableColumn);

    abstract registerActions(tableRowAction);

    abstract registerRowActions(tableAction);
}

export abstract class TableGroupParent {
    abstract name;
}

export const provideTheParent =
    (parent: any, component: any) => {
        return {provide: parent, useExisting: forwardRef(() => component)};
    };
