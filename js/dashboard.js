import { api } from "./api.js";

const guild =
new URLSearchParams(location.search).get("guild");

const channel =
document.getElementById("channelSelect");

const language =
document.getElementById("language");

const personality =
document.getElementById("personality");

const apikey =
document.getElementById("apikey");

async function load(){

    const channels =
    await api("/api/guilds/"+guild+"/channels");

    channel.innerHTML="";

    channels.forEach(c=>{

        channel.innerHTML+=`
        <option value="${c.id}">
            # ${c.name}
        </option>
        `;

    });

    const settings =
    await api("/load?guild="+guild);

    if(settings){

        channel.value=settings.channel;

        language.value=settings.language;

        personality.value=settings.personality;

        apikey.value=settings.apikey;

    }

}

load();
async function user(){

    const me =
    await api("/api/user");

    document.getElementById("user").innerHTML=`
        👤 ${me.username}
    `;

}

user();

document.getElementById("logout").onclick=()=>{

    location.href="index.html";

};

document.getElementById("save").onclick=async()=>{

    await api("/save",{

        method:"POST",

        body:JSON.stringify({

            guild,

            channel:channel.value,

            language:language.value,

            personality:personality.value,

            apikey:apikey.value

        })

    });

    alert("Gespeichert!");

}

