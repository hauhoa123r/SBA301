import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8080",
    timeout: 0,
});

export default api;