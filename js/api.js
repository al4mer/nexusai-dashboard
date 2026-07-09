const API = "https://nexusaidcbot.alamer.workers.dev";

export async function api(path, options = {}) {

    const token = localStorage.getItem("nexusai_token");

    const response = await fetch(API + path, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
        },
        ...options
    });

    return response.json();
}
