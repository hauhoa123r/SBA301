import { ERROR_MESSAGES } from '../../../../shared/utils/messages';

export const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    if (!email) {
        return ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!emailRegex.test(email)) {
        return ERROR_MESSAGES.EMAIL_INVALID;
    }
    return "";
};

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

export const validateToken = (token) => {
    if(!token) {
        return ERROR_MESSAGES.TOKEN_REQUIRED;
    }
}