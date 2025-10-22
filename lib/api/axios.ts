import axios from "axios";
import { API } from "./config";

export const fetch = axios.create({
  baseURL: API.BASE_URL,
  withCredentials: true,
});

fetch.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
