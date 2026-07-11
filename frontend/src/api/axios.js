import axios from "axios";

const api = axios.create({
  timeout: 0,
});

export default api;
