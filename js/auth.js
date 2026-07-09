const worker = "https://DEIN-WORKER.workers.dev";

const loginButton = document.getElementById("loginButton");

if(loginButton){

loginButton.onclick=()=>{

window.location=worker+"/login";

};

}

if(location.pathname.includes("callback")){

const code=new URLSearchParams(location.search).get("code");

if(code){

fetch(worker+"/callback?code="+code)

.then(()=>{

location.href="servers.html";

});

}
}
