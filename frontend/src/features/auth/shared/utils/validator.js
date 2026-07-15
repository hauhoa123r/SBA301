import { ERROR_MESSAGES } from '@/shared/utils/messages.js';

export const validateEmail = (email) => {
    const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
    const normalizedEmail = email?.trim() || "";
    if (!normalizedEmail) {
        return ERROR_MESSAGES.EMAIL_REQUIRED;
    } else if (!emailRegex.test(normalizedEmail)) {
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
    const normalizedToken = token?.trim() || "";
    if(!normalizedToken) {
        return ERROR_MESSAGES.TOKEN_REQUIRED;
    }
    if (!/^\d{6}$/.test(normalizedToken)) {
        return ERROR_MESSAGES.TOKEN_INVALID;
    }
    return "";
};

export const validateResetPasswordToken = (email, token) => {
    if (validateEmail(email) || validateToken(token)) {
        return ERROR_MESSAGES.INVALID_RESET_SESSION;
    }
    return "";
};

export const validateResetPassword = (newPassword, confirmPassword) => {
    if (validatePassword(newPassword)){
        return validatePassword(newPassword);
    }
    if (newPassword !== confirmPassword){
        return ERROR_MESSAGES.CONFIRM_PASSWORD_NOT_MATCH;
    }
    return "";
};

