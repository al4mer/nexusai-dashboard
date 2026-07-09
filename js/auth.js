// js/auth.js

const worker = "https://nexusaidcbot.alamer.workers.dev";

// Login Button
const loginButton = document.getElementById("loginButton");
if (loginButton) {
    loginButton.onclick = () => {
        window.location = worker + "/login";
    };
}

// Callback: Token aus URL holen
const url = new URL(window.location.href);
const token = url.searchParams.get("token");

if (token) {
    localStorage.setItem("nexusai_token", token);
    window.location.href = "servers.html";
}
