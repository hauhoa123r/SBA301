import { ERROR_MESSAGES } from '../../../../shared/utils/messages';

export const validatePassword = (password) => {
    if (!password) {
        return ERROR_MESSAGES.PASSWORD_REQUIRED;
    } else if (password.length < 8) {
        return ERROR_MESSAGES.PASSWORD_LENGTH;
    } else if (!/[A-Z]/.test(password)) {
        return ERROR_MESSAGES.PASSWORD_UPPERCASE;
    }
    return "";
};

export const validateChangePassword = (oldPassword, newPassword, confirmPassword) => {
    if (!oldPassword) {
        return ERROR_MESSAGES.PASSWORD_REQUIRED;
    }
    if (validatePassword(newPassword)){
        return validatePassword(newPassword);
    }
    if (oldPassword === newPassword){
        return ERROR_MESSAGES.INVALID_CHANGE_PASSWORD;
    }
    if (newPassword !== confirmPassword){
        return ERROR_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH;
    }
    return "";
};