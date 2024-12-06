import axios from "axios";
import * as AxiosLogger from "axios-logger";

const Axios = axios.create({
	baseURL: "http://localhost",
	headers: {
		"Content-Type": "application/json",
	},
});

// Request interceptor (logger)
Axios.interceptors.request.use(AxiosLogger.requestLogger);
Axios.interceptors.response.use(AxiosLogger.responseLogger);

export default Axios;
