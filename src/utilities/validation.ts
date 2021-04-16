
//validation Logic
//this interface will extend to the Validate function
export interface Validateable {
    //these are the properties we want to support in our validation
    //optional? the ? is the same as defnining it as a type | undefined
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

export function validate(validatableInput: Validateable) {
    //the default assumption is that the data we all receive is truthy, will be changed later
    let isValid = true;
    if (validatableInput.required) {
        //if user input value length is not 0
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    //if our input is a string 
    //!= one equals sign means we include null and undefined into our comparison
    if (validatableInput.minLength != null && typeof validatableInput.value === 'string') {
        //if the inputs value's (string) length is greater than our defined minLength
        isValid = isValid && validatableInput.value.length > validatableInput.minLength;
    }
    if (validatableInput.maxLength != null && typeof validatableInput.value === 'string') {
        //if the inputs value's (string) length is less than our defined maxLength
        isValid = isValid && validatableInput.value.length < validatableInput.maxLength;
    }
    if (validatableInput.min != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value > validatableInput.min
    }
    if (validatableInput.max != null && typeof validatableInput.value === 'number') {
        isValid = isValid && validatableInput.value < validatableInput.max
    }
    return isValid
}
