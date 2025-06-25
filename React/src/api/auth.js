import { APIClient } from ".";

export const registerAPI = async (data) => {
  return await APIClient.post("/signup", { ...data });
};

export const logInAPI = async (data) => {
  return await APIClient.post("/login", { ...data });
};

export const refreshTokeAPI = async (data) => {
  return await APIClient.post("/refresh-token", { ...data });
};
