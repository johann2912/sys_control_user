var axios = require('axios');

export const BASE_URL = "";

export const DATO_CURIOSO = axios.create({
    baseURL: " https://catfact.ninja/docs",
});