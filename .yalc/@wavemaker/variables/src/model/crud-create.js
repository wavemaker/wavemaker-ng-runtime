var CRUDCreate = /** @class */ (function () {
    function CRUDCreate(variable, manager) {
        this.variable = variable;
        this.manager = manager;
    }
    CRUDCreate.prototype.setInput = function (key, val, options) {
        return this.manager.setInput(this.variable, key, val, options, 'create');
    };
    CRUDCreate.prototype.invoke = function (options, success, error) {
        options = options || {};
        options.operation = 'create';
        return this.manager.invoke(this.variable, options, success, error);
    };
    return CRUDCreate;
}());
export { CRUDCreate };
//# sourceMappingURL=crud-create.js.map