import { api } from "./api.js";

const guild = new URLSearchParams(location.search).get("guild");

const channel = document.getElementById("channelSelect");
const language = document.getElementById("language");
const personality = document.getElementById("personality");
const apikey = document.getElementById("apikey");

// CHANNELS + SETTINGS LADEN
async function load() {

    // Channels holen
    const dataChannels = await api(`/api/guilds/${guild}/channels`);
    const channels = dataChannels.channels;

    channel.innerHTML = "";

    channels.forEach(c => {
        channel.innerHTML += `
            <option value="${c.id}">
                # ${c.name}
            </option>
        `;
    });

    // Settings holen
    const settingsData = await api(`/load?guildId=${guild}`);

    if (settingsData) {

        if (settingsData.settings) {
            channel.value = settingsData.settings.channel || "";
            language.value = settingsData.settings.language || "";
        }

        personality.value = settingsData.personality || "";
        apikey.value = settingsData.keys || "";
    }
}

load();

// USER LADEN
async function user() {
    const me = await api("/api/user");
    document.getElementById("user").innerHTML = `👤 ${me.user.username}`;
}

user();

// LOGOUT
document.getElementById("logout").onclick = () => {
    localStorage.removeItem("nexusai_token");
    location.href = "index.html";
};

// SAVE
document.getElementById("save").onclick = async () => {

    await api("/save", {
        method: "POST",
        body: JSON.stringify({
            guildId: guild,
            settings: {
                channel: channel.value,
                language: language.value
            },
            personality: personality.value,
            keys: apikey.value
        })
    });

    alert("Gespeichert!");
};
