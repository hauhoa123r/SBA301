import * as Validator from "../../features/auth/shared/utils/validator";

const validators = {
    email: Validator.validateEmail,
    password: Validator.validatePassword
};
export const validInput = (name, value) => {
    const validateFn = validators[name];
    return validateFn ? validateFn(value) : "";
};