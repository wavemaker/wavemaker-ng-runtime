var CRUDDelete = /** @class */ (function () {
    function CRUDDelete(variable, manager) {
        this.variable = variable;
        this.manager = manager;
    }
    CRUDDelete.prototype.setInput = function (key, val, options) {
        return this.manager.setInput(this.variable, key, val, options, 'delete');
    };
    CRUDDelete.prototype.invoke = function (options, success, error) {
        options = options || {};
        options.operation = 'delete';
        return this.manager.invoke(this.variable, options, success, error);
    };
    return CRUDDelete;
}());
export { CRUDDelete };
//# sourceMappingURL=crud-delete.js.map