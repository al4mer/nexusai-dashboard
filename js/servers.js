const worker = "https://nexusaidcbot.alamer.workers.dev";

const list = document.getElementById("serverList");

// Token holen
const token = localStorage.getItem("nexusai_token");

if (!token) {
    list.innerHTML = "Nicht eingeloggt!";
    window.location.href = "index.html";
}

async function loadServers() {
    try {
        const response = await fetch(worker + "/api/guilds", {
            headers: {
                "Authorization": "Bearer " + token
            }
        });

        const data = await response.json();
        const guilds = data.guilds;

        list.innerHTML = "";

        if (!guilds || guilds.length === 0) {
            list.innerHTML = "<p>Keine Server gefunden.</p>";
            return;
        }

        guilds.forEach(guild => {
            const card = document.createElement("div");
            card.className = "server-card";

            card.innerHTML = `
                <img
                src="https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png"
                class="server-icon">

                <div class="server-info">
                    <h2>${guild.name}</h2>
                    <p>🤖 NexusAI installiert</p>
                    <p>👑 Administrator</p>
                </div>

                <button class="open">
                    Öffnen →
                </button>
            `;

            card.querySelector(".open").onclick = () => {
                location.href = `dashboard.html?guild=${guild.id}`;
            };

            list.appendChild(card);
        });

    } catch (err) {
        console.error(err);
        list.innerHTML = "Fehler beim Laden.";
    }
}

loadServers();
