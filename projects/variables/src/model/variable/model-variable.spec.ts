import { ModelVariable} from './model-variable';
declare const _;
describe('Model Variable dataset as list', () => {
    let modelVariable: ModelVariable;
    beforeEach(() => {
        const mv = {
            category: 'wm.Variable',
            dataBinding: [],
            dataSet: [{name: 'test', age: 11}],
            isList: true,
            name: 'staticVar1',
            owner: 'Page',
            saveInPhonegap: false,
            twoWayBinding: false,
            type: 'string'
        };
        modelVariable = new ModelVariable(mv);
    });
    it('should add item to the dataset ', () => {
        const newItem = {name: 'a', age: 12};
        modelVariable.addItem(newItem);
        expect(modelVariable.dataSet.length).toEqual(2);
        expect(_.findIndex(modelVariable.dataSet, newItem)).toEqual(modelVariable.dataSet.length - 1);
    });
    it('should add item to the dataset at particular index', () => {
        const newItem = {name: 'b', age: 13};
        const index = 1;
        modelVariable.addItem(newItem, index);
        expect(modelVariable.dataSet.length).toEqual(2);
        expect(_.findIndex(modelVariable.dataSet, newItem)).toEqual(index);
    });
});

describe('Model Variable dataset as object having inner list', () => {
   let modelVariable: ModelVariable;
   let innerList;
   beforeEach(() => {
       const mv = {
           category: 'wm.Variable',
           dataBinding: [],
           dataSet: {
               name: 'test',
               age: 11,
               addresses: [
                   {
                       addressLine1: 'test',
                       addressLine2: 'test',
                       addressType: 'temp'
                   }]
           },
           isList: false,
           name: 'staticVar1',
           owner: 'Page',
           saveInPhonegap: false,
           twoWayBinding: false,
           type: 'string'
       };
       modelVariable = new ModelVariable(mv);
       innerList = modelVariable.dataSet.addresses;
   });
   it('should add item to the innerList', () => {
       const newItem = {addressLine1: 'test1', addressLine2: 'test1', addressType: 'permanent'};
       const options = {
           path: 'addresses'
       };
       modelVariable.addItem(newItem, options);
       expect(innerList.length).toEqual(2);
       expect(_.findIndex(innerList, newItem)).toEqual(innerList.length - 1);
   });
   it('should add item to the innerlist at particular index', () => {
       const newItem = {addressLine1: 'test2', addressLine2: 'test2', addressType: 'temp'};
       const options = {
           path: 'addresses',
           index: 0
       };
       modelVariable.addItem(newItem, options);
       expect(innerList.length).toEqual(2);
       expect(_.findIndex(innerList, newItem)).toEqual(options.index);
   });
});
describe('Model Variable dataset as object having second level inner list', () => {
    let modelVariable: ModelVariable;
    let innerList;
    beforeEach(() => {
        const mv = {
            category: 'wm.Variable',
            dataBinding: [],
            dataSet: {
                name: 'test',
                age: 11,
                addresses: [
                    {
                        addressLine1: 'test',
                        addressLine2: 'test',
                        addressType: 'temp',
                        landMarks: [
                            {
                                landMark1: 'testL1',
                                landMark2: 'testL2'
                            }]
                    }, {
                        addressLine1: 'test',
                        addressLine2: 'test',
                        addressType: 'temp',
                    }]
            },
            isList: false,
            name: 'staticVar1',
            owner: 'Page',
            saveInPhonegap: false,
            twoWayBinding: false,
            type: 'string'
        };
        modelVariable = new ModelVariable(mv);
        innerList = modelVariable.dataSet.addresses;
    });
    it('should add item to the second level inner list', () => {
        const newItem = {landMark1: 'test1L1', landMark2: 'test1L2'};
        const opttions = {
            path: 'addresses[0].landMarks'
        };
        modelVariable.addItem(newItem, opttions);
        expect(innerList[0].landMarks.length).toEqual(2);
        expect(_.findIndex(innerList[0].landMarks, newItem)).toEqual(innerList[0].landMarks.length - 1);
    });
    it('should add item to the second level inner list at particular index', () => {
        const newItem = {landMark1: 'test2L1', landMark2: 'test2L2'};
        const  options = {
            path: 'addresses[0].landMarks',
            index: 0
        };
        modelVariable.addItem(newItem, options);
        expect(innerList[0].landMarks.length).toEqual(2);
        expect(_.findIndex(innerList[0].landMarks, newItem)).toEqual(options.index);
    });
    it('should add item to the innerList which is not present', () => {
        const newItem = {landMark1: 'test1L1', landMark2: 'test1L2'};
        const options = {
            path: 'addresses[1].landMarks'
        };
        modelVariable.addItem(newItem, options);
        expect(innerList[1].landMarks.length).toEqual(1);
        expect(_.findIndex(innerList[1].landMarks, newItem)).toEqual(innerList[1].landMarks.length - 1);
        console.log(modelVariable.dataSet);
    });
});
describe('Model Variable dataset as list having innerList', () => {
    let modelVariable: ModelVariable;
    beforeEach(() => {
        const mv = {
            category: 'wm.Variable',
            dataBinding: [],
            dataSet: [
                {
                    name: 'test',
                    age: 11,
                    addresses: [
                        {
                            addressLine1: 'test',
                            addressLine2: 'test',
                            addressType: 'temp'
                        }]
                },
                {
                    name: 'test1',
                    age: 12
                }],
            isList: true,
            name: 'staticVar1',
            owner: 'Page',
            saveInPhonegap: false,
            twoWayBinding: false,
            type: 'string'
        };
        modelVariable = new ModelVariable(mv);
    });
    it('should add item to the innerList of dataset[0]', () => {
        const newItem = {addressLine1: 'test1', addressLine2: 'test1', addressType: 'permanent'};
        const options = {
            path: 'addresses',
            parentIndex: 0
        };
        modelVariable.addItem(newItem, options);
        const innerList = modelVariable.dataSet[options.parentIndex].addresses;
        expect(innerList.length).toEqual(2);
        expect(_.findIndex(innerList, newItem)).toEqual(innerList.length - 1);
    });
    it('should add item to the innerList of dataset[0] at particular index', () => {
        const newItem = {addressLine1: 'test2', addressLine2: 'test2', addressType: 'temp'};
        const options = {
            path: 'addresses',
            parentIndex: 0,
            index: 0
        };
        modelVariable.addItem(newItem, options);
        const innerList = modelVariable.dataSet[options.parentIndex].addresses;
        expect(innerList.length).toEqual(2);
        expect(_.findIndex(innerList, newItem)).toEqual(options.index);
    });
    it('should add innerList to the dataset[1]', () => {
        const newItem = {addressLine1: 'test3', addressLine2: 'test3', addressType: 'temp'};
        const options = {
            path: 'addresses',
            parentIndex: 1
        };
        modelVariable.addItem(newItem, options);
        const innerList = modelVariable.dataSet[options.parentIndex].addresses;
        expect(innerList.length).toEqual(1);
        expect(_.findIndex(innerList, newItem)).toEqual(innerList.length - 1);
    });
});
describe('Model Variable dataset as object having second level inner list', () => {
    let modelVariable: ModelVariable;
    beforeEach(() => {
        const mv = {
            category: 'wm.Variable',
            dataBinding: [],
            dataSet: [
                {
                    name: 'test',
                    age: 11,
                    addresses: [
                        {
                            addressLine1: 'test',
                            addressLine2: 'test',
                            addressType: 'temp',
                            landMarks: [
                                {
                                    landMark1: 'testL1',
                                    landMark2: 'testL2'
                                }]
                        }, {
                            addressLine1: 'test',
                            addressLine2: 'test',
                            addressType: 'temp',
                        }]
                }, {
                    name: 'test',
                    age: 11
                }],
            isList: true,
            name: 'staticVar1',
            owner: 'Page',
            saveInPhonegap: false,
            twoWayBinding: false,
            type: 'string'
        };
        modelVariable = new ModelVariable(mv);
    });
    it('should add item to the second level inner list of dataset[0]', () => {
        const newItem = {landMark1: 'test1L1', landMark2: 'test1L2'};
        const options = {
            path: 'addresses[0].landMarks',
            parentIndex: 0
        };
        modelVariable.addItem(newItem, options);
        const innerList = modelVariable.dataSet[options.parentIndex].addresses;
        expect(innerList[0].landMarks.length).toEqual(2);
        expect(_.findIndex(innerList[0].landMarks, newItem)).toEqual(innerList[0].landMarks.length - 1);
    });
    it('should add item to the second level inner list at particular index', () => {
        const newItem = {landMark1: 'test2L1', landMark2: 'test2L2'};
        const  options = {
            path: 'addresses[0].landMarks',
            parentIndex: 0,
            index: 0
        };
        modelVariable.addItem(newItem, options);
        const innerList = modelVariable.dataSet[options.parentIndex].addresses;
        expect(innerList[0].landMarks.length).toEqual(2);
        expect(_.findIndex(innerList[0].landMarks, newItem)).toEqual(options.index);
    });
    it('should add item to the innerList which is not present', () => {
        const newItem = {landMark1: 'test1L1', landMark2: 'test1L2'};
        const options = {
            path: 'addresses[1].landMarks',
            parentIndex: 0
        };
        modelVariable.addItem(newItem, options);
        const innerList = modelVariable.dataSet[options.parentIndex].addresses;
        expect(innerList[1].landMarks.length).toEqual(1);
        expect(_.findIndex(innerList[1].landMarks, newItem)).toEqual(innerList[1].landMarks.length - 1);
        console.log(modelVariable.dataSet);
    });
    it('should add innerList to the dataset[1]', () => {
        const newItem = {addressLine1: 'test3', addressLine2: 'test3', addressType: 'temp'};
        const options = {
            path: 'addresses[0].landMarks',
            parentIndex: 1
        };
        modelVariable.addItem(newItem, options);
        const innerList = modelVariable.dataSet[options.parentIndex].addresses;
        expect(innerList[0].landMarks.length).toEqual(1);
        expect(_.findIndex(innerList[0].landMarks, newItem)).toEqual(innerList[0].landMarks.length - 1);
        console.log(modelVariable.dataSet);
    });
});


