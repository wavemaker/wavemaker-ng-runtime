var CRUDUpdate = /** @class */ (function () {
    function CRUDUpdate(variable, manager) {
        this.variable = variable;
        this.manager = manager;
    }
    CRUDUpdate.prototype.setInput = function (key, val, options) {
        return this.manager.setInput(this.variable, key, val, options, 'update');
    };
    CRUDUpdate.prototype.invoke = function (options, success, error) {
        options = options || {};
        options.operation = 'update';
        return this.manager.invoke(this.variable, options, success, error);
    };
    return CRUDUpdate;
}());
export { CRUDUpdate };
//# sourceMappingURL=crud-update.js.map