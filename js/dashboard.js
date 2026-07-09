const worker = "https://DEIN-WORKER.workers.dev";

const guild =
new URLSearchParams(location.search).get("guild");

const channelSelect =
document.getElementById("channelSelect");

async function loadChannels(){

const response = await fetch(

worker+"/api/guilds/"+guild+"/channels",

{

credentials:"include"

}

);

const channels=await response.json();

channelSelect.innerHTML="";

channels.forEach(channel=>{

const option=document.createElement("option");

option.value=channel.id;

option.textContent="# "+channel.name;

channelSelect.appendChild(option);

});

}

loadChannels();

document.getElementById("save").onclick=async()=>{

const settings={

guild,

channel:channelSelect.value,

language:document.getElementById("language").value,

personality:document.getElementById("personality").value,

apikey:document.getElementById("apikey").value

};

await fetch(worker+"/save",{

method:"POST",

headers:{

"Content-Type":"application/json"

},

credentials:"include",

body:JSON.stringify(settings)

});

alert("Gespeichert!");

};
