export default {

async fetch(request, env) {

const url = new URL(request.url);

const path = url.pathname;

/* Login */

if(path=="/login"){

return Response.redirect(
"https://discord.com/oauth2/authorize?...");

}

/* Callback */

if(path=="/callback"){

return new Response("Login erfolgreich");

}

/* Benutzer */

if(path=="/api/user"){

return Response.json({

username:"Max",

id:"123"

});

}

/* Guilds */

if(path=="/api/guilds"){

return Response.json([

{

id:"1",

name:"Mein Server",

icon:""

}

]);

}

/* Channels */

if(path.startsWith("/api/guilds/")){

return Response.json([

{

id:"11",

name:"general"

},

{

id:"22",

name:"ai"

}

]);

}

/* Speichern */

if(path=="/save"){

const data=

await request.json();

await env.DB.prepare(

`INSERT OR REPLACE INTO settings
(guild_id,channel_id,language,personality,apikey)

VALUES(?,?,?,?,?)`

)

.bind(

data.guild,

data.channel,

data.language,

data.personality,

data.apikey

)

.run();

return Response.json({

success:true

});

}

/* Laden */

if(path=="/load"){

const guild=

url.searchParams.get("guild");

const row=

await env.DB.prepare(

"SELECT * FROM settings WHERE guild_id=?"

)

.bind(guild)

.first();

return Response.json(row);

}

return new Response("404");

}

}
