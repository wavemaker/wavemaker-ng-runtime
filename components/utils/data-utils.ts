declare const _;

export function getVariableName(binddataset: string) {
    let variableName,
        isBoundToVariable;
    const parts = binddataset.split('.');

    isBoundToVariable = _.includes(binddataset, 'Variables.');

    if (isBoundToVariable) {
        variableName = parts[1];
    }
    // TODO: Do it for bind widgets
    return variableName;
}

function getVariableCategory(variable) {
    return variable.category;
}

function handleLiveVariableOperations(formData, variable, options) {
    const operationType = options.operationType;

    switch (operationType) {
        case 'update':
            variable.updateRecord({
                row: formData
            });
            break;
        case 'insert':
            variable.insertRecord({
                row: formData
            });
            break;
    }
}

export function performDataOperation(formData, variable, options) {
    const varCategory = getVariableCategory(variable);

    if (varCategory === 'wm.LiveVariable') {
        handleLiveVariableOperations(formData, variable, options);
    }
}


