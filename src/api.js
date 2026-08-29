import axios from "axios";

const api = axios.create({ baseURL: "http://localhost:8080/admin/v1", timeout: 5000, });

export async function fetchProfiles() {
    const res = await api.get(`profiles`);
    return res.data;
}

export async function saveProfile(profileName, profile) {
    const res = await api.put(`profile/${profileName}`, profile);
    return res.data;
}

export async function deleteProfile(profileName) {
    const res = await api.delete(`profile/${profileName}`);
    return res.data;
}

export async function generateProfile(profileName) {
    const res = await api.post(`generate/${profileName}`);
    return res.data;
}
