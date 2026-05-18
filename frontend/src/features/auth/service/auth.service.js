import api from "../../../api/axios";

export const loginApi = async (data) => {
    return api.post("/api/user/login", data);
};