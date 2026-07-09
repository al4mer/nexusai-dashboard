const worker = "https://DEIN-WORKER.workers.dev";

const list = document.getElementById("serverList");

async function loadServers() {

    try {

        const response = await fetch(worker + "/api/guilds", {
            credentials: "include"
        });

        const guilds = await response.json();

        list.innerHTML = "";

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

                location.href =
                `dashboard.html?guild=${guild.id}`;

            };

            list.appendChild(card);

        });

    }

    catch {

        list.innerHTML = "Fehler beim Laden.";

    }

}

loadServers();
