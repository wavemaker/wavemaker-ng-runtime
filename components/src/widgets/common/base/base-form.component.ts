import { StylableComponent } from './stylable.component';

export abstract class BaseFormComponent extends StylableComponent {
    public datavalue;
    private oldDataValue;

    protected invokeOnChange(value, $event?: Event) {

        // invoke the event callback
        if ($event) {
            this.invokeEventCallback('change', {
                $event,
                newVal: value,
                oldVal: this.oldDataValue
            });
        }
        // update the previous value
        this.oldDataValue = value;
    }

    protected updateOldDatavalue(val: any) {
        this.oldDataValue = val;
    }

}