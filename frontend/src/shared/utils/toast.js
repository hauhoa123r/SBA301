import { toast } from "react-toastify";

export const toastContainerConfig = {
    position: "top-right",
    autoClose: 3500,
    newestOnTop: true,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    className: "edu-toast-container",
    toastClassName: "edu-toast",
    bodyClassName: "edu-toast-body",
    progressClassName: "edu-toast-progress",
};

export const getApiErrorMessage = (error, fallback = "Có lỗi xảy ra, vui lòng thử lại sau.") => {
    const data = error?.response?.data;

    if (typeof data === "string") return data || fallback;

    if (data?.data && typeof data.data === "object") {
        return Object.values(data.data)[0] || data.message || fallback;
    }

    return data?.message || fallback;
};

export const showSuccessToast = (message) => {
    toast.success(message);
};

export const showErrorToast = (message) => {
    toast.error(message);
};

export const showApiErrorToast = (error, fallback) => {
    toast.error(getApiErrorMessage(error, fallback));
};
