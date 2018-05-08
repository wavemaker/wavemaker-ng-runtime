export const getUpdateOnTmpl = (updateOn) => {
    updateOn = updateOn || 'blur';
    updateOn = updateOn === 'default' ? 'change' : updateOn;
    return `[ngModelOptions]="{updateOn: '${updateOn}'}"`;
};