export const fullNameValidator = (field, form) => {
    if (field.value && field.value.length < 5) {
        return {
            errorMessage: "Enter your full name."
        };
    }
}

export const registerFullNameValidator = (field, form) => {
    if (field.value) {
        return new Promise(function (resolve, reject) {
            var emailExists = ['test'].filter(function (data) {
                if (data === field.value) {
                    return true;
                }
            });
            if (emailExists.length != 0) {
                return setTimeout(() => {
                    return reject({
                        errorMessage: "The email address is already registered."
                    });
                }, 100);
            }
            resolve();
        });
    }
}

export const nameComparisionValidator = (control, context) => {
    const contextType = context.columns ? 'columns' : 'formfields';

    if (control.value && context[contextType].lastname.value == control.value) {
        return {
            errorMessage: "First name and last name cannot be same."
        };
    }
}
