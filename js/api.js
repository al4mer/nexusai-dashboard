const API = "https://nexusaidcbot.alamer.workers.dev";

export async function api(path, options = {}) {

    const response = await fetch(API + path, {
        credentials: "include",
        headers: {
            "Content-Type": "application/json"
        },
        ...options
    });

    return response.json();

}
