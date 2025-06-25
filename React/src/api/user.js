import { jwtDecode } from "jwt-decode";
import { APIClient } from ".";

// export const getMe = async () => {
//   try {
//     const { token } =
//       JSON.parse(localStorage.getItem("auth-store"))?.state ?? {};
//     if (!token) throw new Error("no token found");
//     const { id } = jwtDecode(token);
//     return await APIClient.get(`/users/${id}`);
//   } catch (error) {
//     throw new Error(error);
//   }
// };

export const getMe = async () => {
  try {
    const { token } =
      JSON.parse(localStorage.getItem("auth-storage"))?.state ?? {}; // ✅ اسم المصبوط
    if (!token) throw new Error("no token found");
    const { id } = jwtDecode(token);
    return await APIClient.get(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }, // تأكد إنك بتبعت التوكن
    });
  } catch (error) {
    throw new Error(error.message || error);
  }
};

