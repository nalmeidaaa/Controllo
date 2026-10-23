import axios from "axios";

export const api = axios.create({
    baseURL: "http://10.87.169.107:8000",
    timeout: 10000,
});

export const BASE_URL = api.defaults.baseURL;
