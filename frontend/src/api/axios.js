import axios from "axios";
import { PORT } from "../api/apiPath";
const api = axios.create({
    baseURL: PORT,
    timeout: 0,
});

export default api;