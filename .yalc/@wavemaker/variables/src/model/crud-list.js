var CRUDList = /** @class */ (function () {
    function CRUDList(variable, manager) {
        this.variable = variable;
        this.manager = manager;
    }
    CRUDList.prototype.setInput = function (key, val, options) {
        return this.manager.setInput(this.variable, key, val, options, 'list');
    };
    CRUDList.prototype.invoke = function (options, success, error) {
        options = options || {};
        options.operation = 'list';
        return this.manager.invoke(this.variable, options, success, error);
    };
    return CRUDList;
}());
export { CRUDList };
//# sourceMappingURL=crud-list.js.map