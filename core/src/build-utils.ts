export const getUpdateOnTmpl = (updateOn, formControlName) => {
    // If formControlName is preset, ngModelOptions should not be set. updateOn should be set through formControl
    if (formControlName) {
        return ``;
    }
    updateOn = updateOn || 'blur';
    updateOn = updateOn === 'default' ? 'change' : updateOn;
    return `[ngModelOptions]="{updateOn: '${updateOn}'}"`;
};