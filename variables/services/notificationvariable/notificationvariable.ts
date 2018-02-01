import {StaticVariable} from '../staticvariable/staticvariable';

export class NotificationVariable extends StaticVariable {

  message: string;

  constructor(variable: any) {
    super(variable);
    Object.assign(this, variable);
  }

  getData() {
    return this.dataSet;
  }

  setData(dataSet: any) {
    this.dataSet = dataSet;
  }

  notify() {
    alert('Notifying: ' + this.message);
  }

  invoke() {
    this.notify();
  }
}
