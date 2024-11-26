export const initScript = (Widget, App, Utils) => {
    /*
     * Use App.getDependency for Dependency Injection
     * eg: var DialogService = App.getDependency('DialogService');
     */
    /* perform any action on widgets/variables within this block */
    Widget.onReady = function() {
        /*
         * variables can be accessed through 'Widget.Variables' property here
         * e.g. to get dataSet in a staticVariable named 'loggedInUser' use following script
         * Widget.Variables.loggedInUser.getData()
         *
         * widgets can be accessed through 'widgetMap' property here
         * e.g. to get value of text widget named 'username' use following script
         * 'widgetMap.username.datavalue'
         */
        const widgetMap = Widget.Widgets;
        const {
            leading_icon,
            trailing_icon,
            input_type,
            required,
        } = Widget.props
        handleLeadingIcon(widgetMap, leading_icon);
        handleTrailingIcon(widgetMap, trailing_icon);
        handleinputType(widgetMap, input_type);
        handleRequired(widgetMap, required);
        Widget.getDatavalue = () => Widget.props.input_text;
    };

    Widget.onPropertyChange = function(propname, newvalue, oldvalue) {
        const widgetMap = Widget.Widgets;
        const {
            leading_icon,
            trailing_icon,
            input_type,
            required
        } = Widget.props
        switch (propname) {
            case 'prop-leading_icon':
                handleLeadingIcon(widgetMap, leading_icon);
                break
            case 'prop-trailing_icon':
                handleTrailingIcon(widgetMap, trailing_icon);
                break
            case 'prop-required':
                handleRequired(widgetMap, required);
                break
            case 'prop-input_type':
                handleinputType(widgetMap, input_type);
                break
        }
    }

    function handleLeadingIcon(widgetMap, leading_icon) {
        widgetMap.textField.nativeElement.classList.remove('with-leading-icon');
        widgetMap.labelCaption.nativeElement.classList.remove('with-leading-icon');
        if (leading_icon == true) {
            widgetMap.labelCaption.class += ' with-leading-icon';
            widgetMap.textField.class += ' with-leading-icon';
        }
    }

    function handleTrailingIcon(widgetMap, trailing_icon) {
        widgetMap.textField.nativeElement.classList.remove('with-trailing-icon');
        widgetMap.labelCaption.nativeElement.classList.remove('with-trailing-icon');
        if (trailing_icon == true) {
            widgetMap.labelCaption.class += ' with-trailing-icon';
            widgetMap.textField.class += ' with-trailing-icon';
        }
    }

    function handleRequired(widgetMap, required) {
        widgetMap.composite.required = required;
    }

    function handleinputType(widgetMap, input_type) {
        widgetMap.textField.type = input_type;
    }

    Widget.buttonTrailingIconClick = function($event, widget) {
        // Widget.invokeEvent('trailingIconButtonOnClick');
    };

}