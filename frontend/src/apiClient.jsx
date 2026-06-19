import axios from "axios";

const apiClient = axios.create({
  baseURL: "http://localhost:5000/api",

  withCredentials: true,

  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.warn("Authentication failed or token expired.");
      }

      if (status === 409) {
        console.warn(
          "Seat Race Condition Detected: Another user grabbed it first.",
        );
      }
    } else {
      console.error("Network Error: Could not reach the server.");
    }

    return Promise.reject(error);
  },
);

export default apiClient;
