import axios from "axios";

export const loginApi = async (data) => {
    return axios.post(
        "http://localhost:8080/api/user/login", data); // Sau này đổi thành auth
};