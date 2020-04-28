import { CrudVariable} from './crud-variable';

declare const _;


describe('Crud Variable setInput tests', () => {
    let crudVariable: CrudVariable;
    beforeEach(() => {
        const mv = {
            'name': 'CrudVariable1',
            'owner': 'Page',
            'category': 'wm.CrudVariable',
            'type': 'com.test.herokuapp.Todo',
            'service': 'herokuapp',
            'operation': 'todo-controller',
            'operationId': 'todo-controller',
            'crudOperationId': 'herokuapp.todo-controller',
            'operationType': 'list',
            'serviceType': 'OpenAPIService',
            'dataSet': [],
            'isList': true,
            'maxResults': 20,
            'startUpdate': true,
            'autoUpdate': false,
            'inFlightBehavior': 'executeLast',
            'transformationRequired': false,
            'saveInPhonegap': false,
            'isDefault': false,
            'controller': 'todo-controller',
            'dataBinding': {}
        };
        crudVariable = new CrudVariable(mv);
    });
    it('list.setInput(object) ', () => {
        const newItem = {page: 1, size: 10};
        crudVariable.list.setInput(newItem);
        expect(crudVariable.dataBinding.list.page).toBe(1);
    });
    it('list.setInput(key, value) ', () => {
        crudVariable.list.setInput('size', 10);
        expect(crudVariable.dataBinding.list.size).toBe(10);
    });
    it('create.setInput(object) ', () => {
        const newItem = {
                'Employee': {
                    'firstName': 'John',
                    'lastName': 'Doe'
                }
            };
        crudVariable.create.setInput(newItem);
        expect(crudVariable.dataBinding.create.Employee.firstName).toBe('John');
    });
    it('create.setInput(key, value) ', () => {
        crudVariable.create.setInput('Employee', {
            'firstName': 'John',
            'lastName': 'Doe'
        });
        expect(crudVariable.dataBinding.create.Employee.lastName).toBe('Doe');
    });
    it('update.setInput(object) ', () => {
        const newItem = {
            'Employee': {
                'firstName': 'John',
                'lastName': 'Doe'
            },
            'empId': 20
        };
        crudVariable.update.setInput(newItem);
        expect(crudVariable.dataBinding.update.empId).toBe(20);
        expect(crudVariable.dataBinding.update.Employee.firstName).toBe('John');
    });
    it('update.setInput(key, value) ', () => {
        crudVariable.update.setInput('Employee', {
            'firstName': 'Jane',
            'lastName': 'Doe'
        });
        crudVariable.update.setInput('empId', 30);
        expect(crudVariable.dataBinding.update.empId).toBe(30);
        expect(crudVariable.dataBinding.update.Employee.firstName).toBe('Jane');
    });
    it('delete.setInput(object) ', () => {
        const newItem = {
            'empId': 2
        };
        crudVariable.delete.setInput(newItem);
        expect(crudVariable.dataBinding.delete.empId).toBe(2);
    });
    it('delete.setInput(key, value) ', () => {
        crudVariable.delete.setInput('empId', 50);
        expect(crudVariable.dataBinding.delete.empId).toBe(50);
    });
});
