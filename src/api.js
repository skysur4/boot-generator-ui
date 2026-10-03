import axios from "axios";
const baseUrl = "http://localhost:8080/admin/v1/";
const api = axios.create({ baseURL: baseUrl, timeout: 50000, });

export async function fetchProfiles() {
    const res = await api.get(`profiles`);
    return res.data;
}

export async function saveProfile(profileName, profile) {
    const res = await api.put(`profile/${encodeURIComponent(profileName)}`, profile);
    return res.data;
}

export async function deleteProfile(profileName) {
    const res = await api.delete(`profile/${encodeURIComponent(profileName)}`);
    return res.data;
}

export async function generateProfile(profileName) {
    const res = await api.post(`generate/${encodeURIComponent(profileName)}`);
    return res.data;
}

export async function downloadProfile(profileName) {
    const res = await fetch(baseUrl + `download/${encodeURIComponent(profileName)}`);

    if (!res.ok) {
        throw new Error(`Download failed: ${res.status}`);
    }

    const blob = await res.blob();

    // Get filename
    let fileName = `${encodeURIComponent(profileName)}.zip`;

    const contentDisposition = res.headers.get("Content-Disposition");

    if (contentDisposition) {
        const match = contentDisposition.match(
            /filename\*=UTF-8''([^;]+)|filename="?([^"]+)"?/i
        );

        if (match) {
            fileName = decodeURIComponent(match[1] || match[2]);
        }
    }

    // Trigger browser download
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}
