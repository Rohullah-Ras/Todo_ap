// import axios from 'axios';
//
// export const API_BASE =
//   import.meta.env.VITE_API_BASE ?? 'http://localhost:3005/api';
//
// export const http = axios.create({
//   baseURL: API_BASE,
//   withCredentials: true, // belangrijk voor httpOnly cookie auth
//   headers: {
//     'Content-Type': 'application/json',
//     Accept: 'application/json',
//   },
//   timeout: 15000,
// });
//
// // Optioneel: response error normalizer
// http.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     // Geen gevoelige info loggen in productie
//     return Promise.reject(err);
//   },
// );