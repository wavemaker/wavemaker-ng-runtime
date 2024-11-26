import { registerCustomWidgetConfig } from '../../framework/util/page-util';

export const initCustomWidgetConfig = () => {
    registerCustomWidgetConfig('switch_button', {
	"widgetType": "wm-checkbox",
	"properties": {
		"switch_type": {
			"type": "list",
			"displayName": "Switch Type",
			"description": "Specifies the style of the switch. Options include 'filled', 'condensed', and 'iOS'.",
			"options": ["Filled", "Condensed", "IOS"],
			"value": "Filled"
		},
		"state": {
			"type": "list",
			"displayName": "State",
			"description": "Specifies whether the component is active or inactive. 'enabled' means the component is interactive and functional, while 'disabled' means it is non-interactive and inactive.",
			"options": ["Enabled", "Disabled"],
			"value": "Enabled"
		},
		"label_text": {
			"type": "string",
			"displayName": "Label Text",
			"description": "Sets the text displayed on the label of the switch.",
			"value": ""
		},
		"icon": {
			"type": "boolean",
			"displayName": "Switch Icons",
			"description": "Enables or disables icon options for the switch. If true, you can select icons for the switch.",
			"value": false
		},
		"selected_icon": {
			"type": "string",
			"displayName": "Selected Icon",
			"description": "Specifies the icon to use when the switch is in the selected state.",
			"value": "fa fa-check",
			"widget": "select-icon"
		},
		"unselected_icon": {
			"type": "string",
			"displayName": "Unselected Icon",
			"description": "Specifies the icon to use when the switch is in the unselected state.",
			"value": "fa fa-close",
			"widget": "select-icon"
		},
		"selected": {
			"type": "string",
			"displayName": "Default Value",
			"description": "Specifies the default value of the switch. This value is used to represent the state of the switch. For example, 'true' for checked and 'false' for unchecked.",
			"value": "false"
		},
		"checked_value": {
			"type": "string",
			"displayName": "Checked Value",
			"description": "Specifies the value to represent the switch when it is checked.",
			"value": "true"
		},
		"unchecked_value": {
			"type": "string",
			"displayName": "Unchecked Value",
			"description": "Specifies the value to represent the switch when it is unchecked.",
			"value": "false"
		},
		"required": {
			"type": "boolean",
			"displayName": "Required",
			"description": "Indicates whether the switch is required. Set to true to make it a required field.",
			"value": false
		}
	},
	"events": {}
}
)
registerCustomWidgetConfig('divider', {
  "widgetType" : "wm-container",
  "properties" : {
    "orientation" : {
      "type" : "list",
      "displayName" : "Orientation",
      "description" : "Determines the style of the M3 divider being used. Default value is horizontal/full-width.",
      "options" : [ "horizontal/full-width", "horizontal/middle-inset", "horizontal/inset", "vertical/full-width", "vertical/middle-inset", "vertical/inset" ],
      "value" : "horizontal/full-width"
    },
    "vertical_height" : {
      "type" : "integer",
      "displayName" : "Height (only for vertical)",
      "description" : "Determines the height of the vertical divider (in px)",
      "value" : 50
    }
  },
  "events" : {
    "onRender" : {
      "description" : "Callback action to test event in the properties panel",
      "eventData" : "",
      "displayName" : "Render"
    }
  }
}
)
registerCustomWidgetConfig('icon_button', {
  "widgetType" : "wm-button",
  "properties" : {
    "style" : {
      "type" : "list",
      "displayName" : "Style",
      "description" : "Specifies the style of the widget. Options include 'Filled', 'Standard', and 'Outlined'.",
      "options" : [ "Filled", "Standard", "Outlined" ],
      "value" : "Filled"
    },
    "state" : {
      "type" : "list",
      "displayName" : "State",
      "description" : "Specifies whether the component is active or inactive. 'enabled' means the component is interactive and functional, while 'disabled' means it is non-interactive and inactive.",
      "options" : [ "Enabled", "Disabled" ],
      "value" : "Enabled"
    },
    "icon_class" : {
      "type" : "string",
      "displayName" : "Icon class",
      "description" : "Specifies the icon class to be used inside icon button ",
      "value" : "fa fa-gear",
      "widget" : "select-icon"
    },
    "button_size" : {
      "type" : "list",
      "displayName" : "Button size",
      "description" : "This is an optinal property. the value for this property must be either 'xs' for extrasmall etc.",
      "options" : [ "xs", "sm", "md", "lg" ],
      "value" : "md"
    },
    "color" : {
      "type" : "list",
      "displayName" : "Tonal",
      "description" : "This is an optinal property. The value for this property must be either secondary, tertiary, success, error, info, warning.",
      "options" : [ "Default", "Primary", "Secondary", "Tertiary", "Success", "Info", "Warning", "Error" ],
      "value" : "Default"
    }
  },
  "events" : {
    "onRender" : {
      "description" : "Callback action to test event in the properties panel",
      "eventData" : "",
      "displayName" : "Render"
    }
  }
}
)
registerCustomWidgetConfig('icon_button_toggleable', {
    "widgetType" : "wm-checkbox",
    "properties" : {
      "state" : {
        "type" : "list",
        "displayName" : "State",
        "description" : "Specifies whether the component is active or inactive. 'enabled' means the component is interactive and functional, while 'disabled' means it is non-interactive and inactive.",
        "options" : [ "Enabled", "Disabled" ],
        "value" : "Enabled"
      },
      "style" : {
        "type" : "list",
        "displayName" : "Style",
        "description" : "Specifies the style of the widget. Options include 'Filled', 'Standard', and 'Outlined'.",
        "options" : [ "Filled", "Standard", "Outlined" ],
        "value" : "Filled"
      },
      "button_size" : {
        "type" : "list",
        "displayName" : "Button size",
        "description" : "This is an optinal property. the value for this property must be either 'xs' for extrasmall etc.",
        "options" : [ "xs", "sm", "md", "lg" ],
        "value" : "md"
      },
      "color" : {
        "type" : "list",
        "displayName" : "Tonal",
        "description" : "This is an optinal property. The value for this property must be either secondary, tertiary, success, error, info, warning.",
        "options" : [ "Default", "Primary", "Secondary", "Tertiary", "Success", "Info", "Warning", "Error" ],
        "value" : "Default"
      },
      "icon_class_unselected" : {
        "type" : "string",
        "displayName" : "Unselected Icon class",
        "description" : "Specifies the icon class to use when the icon button toggleable is in the unselected state.",
        "value" : "fa fa-gear",
        "widget" : "select-icon"
      },
      "icon_class_selected" : {
        "type" : "string",
        "displayName" : "Selected Icon class",
        "description" : "Specifies the icon class to use when the icon button toggleable is in the selected state.",
        "value" : "fa fa-gear",
        "widget" : "select-icon"
      },
      "selected" : {
        "type" : "boolean",
        "displayName" : "Selected",
        "description" : "Specifies the default value of the icon button toggleable. This value is used to represent the state of the widget. For example, 'true' for checked and 'false' for unchecked.",
        "value" : false
      }
    },
    "events" : {
      "onRender" : {
        "description" : "Callback action to test event in the properties panel",
        "eventData" : "",
        "displayName" : "Render"
      }
    }
  }
  )
registerCustomWidgetConfig('input_chip', {
  "widgetType" : "wm-container",
  "properties" : {
    "state" : {
      "type" : "list",
      "displayName" : "State",
      "description" : "Specifies whether the component is active or inactive. 'enabled' means the component is interactive and functional",
      "options" : [ "enabled" ],
      "value" : "enabled"
    },
    "configuration" : {
      "type" : "list",
      "options" : [ "Label only", "Label & Leading icon", "Label & avatar" ],
      "displayName" : "Configuration",
      "description" : "Specifies to show/hide the Label, Leading Icon and avatar.",
      "value" : "Label only"
    },
    "show_closing_icon" : {
      "type" : "boolean",
      "displayName" : "Show Closing icon",
      "value" : "false",
      "description" : "Specifies to show/hide the closing Icon."
    },
    "selected" : {
      "type" : "boolean",
      "displayName" : "Selected",
      "value" : "false",
      "description" : "Specifies the default value of the input chip. This value is used to represent the state of the input chip. For example, 'true' for selected and 'false' for unselected."
    },
    "label_text" : {
      "type" : "string",
      "displayName" : "Label text",
      "description" : "Specifies the label value of the Input chip.",
      "value" : "Label"
    },
    "leading_icon_class" : {
      "type" : "string",
      "displayName" : "Leading Icon Class",
      "description" : "Allows to specify the icon for the Leading Icon/Button from wm icon library.",
      "value" : "fa fa-user",
      "widget" : "select-icon"
    },
    "trailing_icon_class" : {
      "type" : "string",
      "displayName" : "Trailing Icon Class",
      "description" : "Allows to specify the icon for the Trailing Icon/Button from wm icon library.",
      "value" : "wi wi-clear",
      "widget" : "select-icon"
    },
    "picture_source" : {
      "type" : "string",
      "displayName" : "Avatar Source",
      "description" : "Allows you to specify the source URL for the avatar image.",
      "value" : "resources/images/imagelists/default-image.png"
    }
  },
  "events" : {
    "onRender" : {
      "description" : "Callback action to test event in the properties panel",
      "eventData" : "",
      "displayName" : "Render"
    }
  }
}
)
registerCustomWidgetConfig('progressbar', {
  "widgetType" : "wm-progress-bar",
  "properties" : {
    "progress" : {
      "type" : "string",
      "displayName" : "Progress",
      "description" : "Sets the current progress of the bar. This value represents the percentage of completion.",
      "value" : "0"
    },
    "linear_type" : {
      "type" : "list",
      "displayName" : "Progress Type",
      "description" : "Specifies the type of progress bar. Options include 'determinate' for a fixed progress bar or 'indeterminate' for an animated progress bar without a fixed end.",
      "options" : [ "Determinate", "Indeterminate" ],
      "value" : "Determinate"
    },
    "color" : {
      "type" : "list",
      "displayName" : "Color Variant",
      "description" : "Specifies the type of color for progress indicator. Options include like 'Success' for a success color progress indicator.",
      "options" : [ "Primary", "Secondary", "Tertiary", "Success", "Info", "Warning", "Error" ],
      "value" : "Primary"
    },
    "transition_duration" : {
      "type" : "string",
      "displayName" : "Transition Duration",
      "description" : "Defines the duration of the progress transition animation. This value should be specified in a time format such as '500ms' or '2s'.",
      "value" : "0.75s"
    }
  },
  "events" : { }
}
)
registerCustomWidgetConfig('slider', {
  "widgetType" : "wm-slider",
  "properties" : {
    "state" : {
      "type" : "list",
      "displayName" : "State",
      "description" : "Defines whether the widget is interactive or not. 'Enabled' means the widget is interactive and functional, while 'Disabled' means it is non-interactive and inactive.",
      "options" : [ "Enabled", "Disabled" ],
      "value" : "Enabled"
    },
    "show_labels" : {
      "type" : "boolean",
      "displayName" : "Show Labels",
      "description" : "Determines whether labels should be displayed on the widget. When set to true, lables will be shown. When false, labels will be hidden.",
      "value" : false
    },
    "show_icons" : {
      "type" : "boolean",
      "displayName" : "Show Icons",
      "description" : "Determines whether icons should be displayed on the widget. When set to true, icons will be shown. When false, icons will be hidden.",
      "value" : false
    },
    "start_icon" : {
      "type" : "string",
      "displayName" : "Start Icon",
      "description" : "The icon to be displayed at the start of the widget. Select an appropriate icon from the available options.",
      "value" : "wi wi-minus",
      "widget" : "select-icon"
    },
    "end_icon" : {
      "type" : "string",
      "displayName" : "End Icon",
      "description" : "The icon to be displayed at the end of the widget. Select an appropriate icon from the available options.",
      "value" : "wi wi-plus",
      "widget" : "select-icon"
    },
    "icon_actions" : {
      "type" : "boolean",
      "displayName" : "Icon Actions",
      "description" : "Determines whether the icons on the widget are interactive. When set to true, icons will respond to user actions (e.g., clicks). When false, icons will be displayed but not interactive.",
      "value" : "false"
    },
    "value" : {
      "type" : "string",
      "displayName" : "Default Value",
      "description" : "Sets the default value for the slider. This value is used when the widget is initially rendered.",
      "value" : "50"
    },
    "min_value" : {
      "type" : "integer",
      "displayName" : "Minimum Value",
      "description" : "Specifies the smallest value the slider can be set to.",
      "value" : "0"
    },
    "max_value" : {
      "type" : "integer",
      "displayName" : "Maximum Value",
      "description" : "Specifies the largest value the slider can be set to.",
      "value" : "100"
    }
  },
  "events" : {
    "onChange" : {
      "type" : "function",
      "displayName" : "On Change",
      "description" : "Function to be called when the value of the slider changes. This function receives parameters such as the event, widget, new value, and old value.",
      "value" : "slider1Change($event, widget, newVal, oldVal)"
    },
    "onDecrement" : {
      "type" : "function",
      "displayName" : "On Decrement",
      "description" : "Function to be called when the value of the slider decreased. This function receives parameters such as the event, widget.",
      "value" : "decrementButtonClick($event, widget)"
    },
    "onIncrement" : {
      "type" : "function",
      "displayName" : "On Increment",
      "description" : "Function to be called when the value of the slider increased. This function receives parameters such as the event, widget.",
      "value" : "incrementButtonClick($event, widget)"
    }
  }
}
)
registerCustomWidgetConfig('textfield', {
  "widgetType" : "wm-input-text",
  "properties" : {
    "style" : {
      "type" : "list",
      "displayName" : "Style",
      "description" : "Specifies the style variant between outlined and filled.",
      "options" : [ "Outlined", "Filled" ],
      "value" : "Outlined"
    },
    "state" : {
      "type" : "list",
      "displayName" : "State",
      "description" : "Specifies whether the TextField is interactive(enabled) or non-interactive(disabled) state.",
      "options" : [ "Enabled", "Disabled" ],
      "value" : "Enabled"
    },
    "text_configurations" : {
      "type" : "string",
      "displayName" : "Text configurations",
      "description" : "Allows you to specify different text types for the TextField, including input text, label text, and placeholder text.",
      "options" : [ "Input text", "Label text", "Placeholder text" ],
      "value" : "Input text",
      "show" : false
    },
    "leading_icon" : {
      "type" : "boolean",
      "displayName" : "Leading icon",
      "description" : "Specifies to show/hide the Leading Icon/Button.",
      "value" : "false"
    },
    "trailing_icon" : {
      "type" : "boolean",
      "displayName" : "Trailing icon",
      "description" : "Specifies to show/hide the Trailing Icon/Button. ",
      "value" : "false"
    },
    "show_supporting_text" : {
      "type" : "boolean",
      "displayName" : "Show supporting text",
      "description" : "Specifies to show/hide the Supporting text(help text).",
      "value" : "false"
    },
    "label_text" : {
      "type" : "string",
      "displayName" : "Caption",
      "description" : "Specifies the caption value of the TextField.",
      "value" : "Label"
    },
    "placeholder_text" : {
      "type" : "string",
      "displayName" : "Placeholder",
      "description" : "Specifies the caption text of the TextField.",
      "value" : "Enter Text"
    },
    "input_text" : {
      "type" : "string",
      "displayName" : "Default Value",
      "description" : "Specifies the default value of the TextField.",
      "value" : ""
    },
    "supporting_text" : {
      "type" : "string",
      "displayName" : "Supporting Text",
      "description" : "Specifies the supporting text(helper text) value of the TextField.",
      "value" : "Supporting Text"
    },
    "leading_icon_class" : {
      "type" : "string",
      "displayName" : "Leading Icon Class",
      "description" : "Allows to specify the icon for the Leading Icon/Button from wm icon library.",
      "value" : "wi wi-search",
      "widget" : "select-icon"
    },
    "trailing_icon_class" : {
      "type" : "string",
      "displayName" : "Trailing Icon Class",
      "description" : "Allows to specify the icon for the Trailing Icon/Button from wm icon library.",
      "value" : "wi wi-clear",
      "widget" : "select-icon"
    },
    "input_type" : {
      "type" : "list",
      "displayName" : "Input Type",
      "description" : "Specifies the input type between text, password and tel.",
      "options" : [ "text", "password", "tel" ],
      "value" : "text"
    },
    "required" : {
      "type" : "boolean",
      "displayName" : "Required",
      "description" : "Specifies the textfiled to be mandatory while submittion.",
      "value" : "false"
    }
  },
  "events" : {
    "trailingIconButtonOnClick" : {
      "type" : "event",
      "displayName" : "Trailing Icon Button onClick",
      "description" : "Function to be called when the value of the slider changes. This function receives parameters such as the event, widget, new value, and old value.",
      "value" : "buttonTrailingIconClick($event, widget)"
    }
  }
}
)
registerCustomWidgetConfig('checkbox_set', {
	"widgetType" : "wm-checkbox",
	"properties" : {
	  "layout" : {
		"type" : "list",
		"displayName" : "Layout",
		"description" : "Defines the orientation of the element. 'horizontal' indicates that the element's layout or behavior is aligned along the horizontal axis (left to right), while 'vertical' means the element is aligned along the vertical axis (top to bottom)",
		"options" : [ "horizontal", "vertical" ],
		"value" : "horizontal"
	  },
	  "show_intermediate" : {
		"type" : "boolean",
		"displayName" : "Intermediate checkbox",
		"description" : "Controls whether the checkbox shows an indeterminate state. True displays the intermediate state",
		"value" : false
	  },
	  "state" : {
		"type" : "list",
		"displayName" : "State",
		"description" : "Specifies whether the component is active or inactive. 'enabled' means the component is interactive and functional, while 'disabled' means it is non-interactive and inactive",
		"options" : [ "Enabled", "Disabled" ],
		"value" : "Enabled"
	  },
	  "label_placement" : {
		"type" : "list",
		"displayName" : "Label placement",
		"description" : "Specifies the label's position relative to the component, with options: 'top' (Label appears above the component), 'bottom' (Label appears below the component), 'start' (Label appears left of the component)",
		"options" : [ "top", "bottom", "start", "end" ],
		"value" : "end"
	  },
	  "label_text" : {
		"type" : "string",
		"displayName" : "Label text",
		"description" : "Label text informs users about what information is requested for a checkboxSet",
		"value" : "Label Text"
	  },
	  "data_set" : {
		"type" : "string",
		"displayName" : "Data Set values",
		"description" : "Defines the available options for the data set, typically a list of labels such as 'Option1', 'Option2', 'Option3'",
		"value" : "Option1,Option2,Option3"
	  },
	  "default_value" : {
		"type" : "string",
		"displayName" : "Default Value",
		"description" : "Specifies the default value for the checked attribute. Default is 'Option1'",
		"value" : ""
	  },
	  "required" : {
		"type" : "boolean",
		"displayName" : "Required",
		"description" : "Indicates whether the checkboxSet is mandatory. True makes it required; false means it is optional",
		"value" : false
	  }
	},
	"events" : { }
  }
  )
registerCustomWidgetConfig('radio_set', {
	"widgetType" : "wm-radioset",
	"properties" : {
	  "layout" : {
		"type" : "list",
		"displayName" : "Layout",
		"description" : "Defines the orientation of the element. 'horizontal' indicates that the element's layout or behavior is aligned along the horizontal axis (left to right), while 'vertical' means the element is aligned along the vertical axis (top to bottom)",
		"options" : [ "horizontal", "vertical" ],
		"value" : "horizontal"
	  },
	  "state" : {
		"type" : "list",
		"displayName" : "State",
		"description" : "Specifies whether the component is active or inactive. 'enabled' means the component is interactive and functional, while 'disabled' means it is non-interactive and inactive",
		"options" : [ "Enabled", "Disabled" ],
		"value" : "Enabled"
	  },
	  "label_placement" : {
		"type" : "list",
		"displayName" : "Label Placement",
		"description" : "Specifies the label's position relative to the component. Options: 'top' (Label appears above the component), 'bottom' (Label appears below the component), 'start' (Label appears left of the component)",
		"options" : [ "top", "bottom", "start", "end" ],
		"value" : "end"
	  },
	  "label_text" : {
		"type" : "string",
		"displayName" : "Label Text",
		"description" : "Label text informs users about what information is requested for a RadioSet",
		"value" : "Label Text"
	  },
	  "data_set" : {
		"type" : "string",
		"displayName" : "Data Set Values",
		"description" : "Defines the available options for the data set, typically a list of labels such as 'Option1', 'Option2', 'Option3'",
		"value" : "Option1,Option2,Option3"
	  },
	  "default_value" : {
		"type" : "string",
		"displayName" : "Default Value",
		"description" : "Specifies the default value for the checked attribute. Default is 'Option1'",
		"value" : ""
	  },
	  "required" : {
		"type" : "boolean",
		"displayName" : "Required",
		"description" : "Indicates whether the RadioSet label is mandatory. True makes it required; false means it is optional",
		"value" : false
	  }
	},
	"events" : { }
  }
  )
    return true;
};