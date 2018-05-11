import { StylableComponent } from './stylable.component';

export abstract class BaseFormComponent extends StylableComponent {
    public datavalue;
    private prevDatavalue;

    protected invokeOnChange(value, $event?: Event) {

        // invoke the event callback
        if ($event) {
            this.invokeEventCallback('change', {
                $event,
                newVal: value,
                oldVal: this.prevDatavalue
            });
        }
        // update the previous value
        this.prevDatavalue = value;
    }

    protected updatePrevDatavalue(val: any) {
        this.prevDatavalue = val;
    }

}