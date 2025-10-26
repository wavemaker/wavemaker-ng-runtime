// Global type declarations for jQuery extensions
// Using declaration merging to extend existing jQuery types

declare global {
    interface JQueryStatic {
        ui?: {
            widget?: any;
            [key: string]: any;
        };
    }

    interface JQuery {
        DataTable?(options?: any): any;
        destroy?(): void;
        datatable?(method: string, ...args: any[]): any;
        datatable?(options?: any): any;
    }
    
    // Extend jQuery.fn namespace for DataTable plugin
    namespace JQueryStatic {
        interface fn {
            DataTable?: any;
        }
    }
}

export {};
