let errors = [];

export function getErrors() {
    return errors;
}
export function addError(error) {
    console.log(error)
    errors.push(error);
}