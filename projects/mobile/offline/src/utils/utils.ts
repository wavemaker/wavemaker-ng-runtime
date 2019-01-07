export const escapeName = (name) => {
    if (name) {
        name = name.replace(/"/g, '""');
        return '"' + name + '"';
    }
};