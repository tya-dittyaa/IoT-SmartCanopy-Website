import axios from "axios";

const metaEnv = import.meta.env;
const BASE_URL = metaEnv.VITE_API_BASE_URL as string | undefined;

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 10_000,
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
