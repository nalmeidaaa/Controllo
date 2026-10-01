import axios from "axios";

export const api = axios.create({
    baseURL: "http://192.168.1.8:8000",
    timeout: 10000,
});
