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

function onSuccess(response, res, rej) {
    if (response.error) {
        rej(response);
    } else {
        res(response);
    }
}


export function performDataOperation(requestData, variable, options): Promise<any> {
    const varCategory = getVariableCategory(variable);

    if (varCategory === 'wm.LiveVariable') {
        return new Promise((res, rej) => {
            let fn;
            const operationType = options.operationType;

            switch (operationType) {
                case 'update':
                    fn = 'updateRecord';
                    break;
                case 'insert':
                    fn = 'insertRecord';
                    break;
                case 'delete':
                    fn = 'delete';
                    break;
            }
            variable[fn](requestData, response => onSuccess(response, res, rej), rej);
        });
    }

    return Promise.resolve();
}


