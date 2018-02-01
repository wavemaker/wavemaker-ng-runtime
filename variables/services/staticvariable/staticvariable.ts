export class StaticVariable {

  name: string;
  _id: string;
  owner: string;
  category: string;
  dataSet: any;
  dataBinding: any;
  type: any;
  isList: boolean;
  saveInPhonegap: any;

  constructor(variable: any) {
    Object.assign(this, variable);
  }

  getData() {
    return this.dataSet;
  }

  setData(dataSet: any) {
    this.dataSet = dataSet;
  }

}
