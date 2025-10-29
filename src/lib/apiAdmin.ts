// src/lib/apiAdmin.ts
import axios from "axios";

const http = axios.create({
  baseURL: "http://localhost:5000/api/admin",
  withCredentials: true,
});

// TEAM
export const teamAPI = {
  list: () => http.get("/team").then((r) => r.data),
  create: (form: FormData) => http.post("/team", form).then((r) => r.data),
  update: (id: string, form: FormData) =>
    http.put(`/team/${id}`, form).then((r) => r.data),
  delete: (id: string) => http.delete(`/team/${id}`).then((r) => r.data),
};

// POSTS
export const postsAPI = {
  list: () => http.get("/posts").then((r) => r.data),
  create: (data: FormData) => http.post("/posts", data).then((r) => r.data),
  update: (id: string, data: FormData) =>
    http.put(`/posts/${id}`, data).then((r) => r.data),
  delete: (id: string) => http.delete(`/posts/${id}`).then((r) => r.data),
};

// ALBUMS
export const albumsAPI = {
  list: () => http.get("/albums").then((r) => r.data),
  create: (form: FormData) => http.post("/albums", form).then((r) => r.data),
  update: (id: string, form: FormData) =>
    http.put(`/albums/${id}`, form).then((r) => r.data),
  delete: (id: string) => http.delete(`/albums/${id}`).then((r) => r.data),
};

// BRANCHES
export const branchesAPI = {
  list: () => http.get("/branches").then((r) => r.data),
  create: (data: any) => http.post("/branches", data).then((r) => r.data),
  update: (id: string, data: any) =>
    http.put(`/branches/${id}`, data).then((r) => r.data),
  delete: (id: string) => http.delete(`/branches/${id}`).then((r) => r.data),
};

// SETTINGS
export const settingsAPI = {
  get: () => http.get("/settings").then((r) => r.data),
  update: (form: FormData) => http.put("/settings", form).then((r) => r.data),
};
