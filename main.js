let matches = [];
const container = document.getElementById("matches");
const saved = JSON.parse(localStorage.getItem("prode")) || {};
let username = localStorage.getItem("username") || "";

// PERFIL
const usernameInput = document.getElementById("username");
const saveBtn = document.getElementById("saveProfile");
const greeting = document.getElementById("greeting");

usernameInput.value = username;
if(username) greeting.textContent = `Hola, ${username}!`;

saveBtn.onclick = () => {
  username = usernameInput.value.trim();
  if(username==="") return;
  localStorage.setItem("username", username);
  greeting.textContent = `Hola, ${username}!`;
};

// CARGAR JSON
fetch("data/2026-02/matches.json")
  .then(res => res.json())
  .then(data => {
    matches = data;
    matches.forEach(renderMatch);
  });

function renderMatch(m,index){
  const div = document.createElement("div");
  div.className="match";

  div.innerHTML = `
    <div class="teams">
      <div class="team local">${m.local}</div>
      <div class="team visit">${m.visit}</div>
    </div>
    <div class="empate">Empate</div>
    <div class="inputs">
      <input type="number" min="0" class="localInput">
      <span>-</span>
      <input type="number" min="0" class="visitInput">
    </div>
    <div class="actions">
      <button class="confirmBtn">Confirmar</button>
      <span class="points" style="margin-left:10px;"></span>
    </div>
  `;

  const localInput = div.querySelector(".localInput");
  const visitInput = div.querySelector(".visitInput");
  const localTxt = div.querySelector(".local");
  const visitTxt = div.querySelector(".visit");
  const empateTxt = div.querySelector(".empate");
  const btn = div.querySelector(".confirmBtn");
  const pointsTxt = div.querySelector(".points");

  let confirmed = false;

  if(saved[m.id]){
    localInput.value = saved[m.id].l;
    visitInput.value = saved[m.id].v;
    confirmed = saved[m.id].confirmed;
    paint();
    if(confirmed) lock();
  }

  function paint(){
    localTxt.className = "team local";
    visitTxt.className = "team visit";
    empateTxt.className = "empate";

    const l = Number(localInput.value);
    const v = Number(visitInput.value);

    if(isNaN(l) || isNaN(v)) return;

    if(l>v){
      localTxt.classList.add("local-win");
      visitTxt.classList.add("visit-win");
    } else if(v>l){
      visitTxt.classList.add("local-win");
      localTxt.classList.add("visit-win");
    } else {
      empateTxt.classList.add("draw");
    }

    pointsTxt.textContent = calcPoints(l,v,m.result);
  }

  function calcPoints(userL,userV,actual){
    if(!actual.local && !actual.visit) return "";
    let points=0;
    if((userL>userV && actual.local>actual.visit) || 
       (userV>userL && actual.visit>actual.local) || 
       (userL===userV && actual.local===actual.visit)){
      points+=3;
    }
    if(userL===actual.local) points+=1;
    if(userV===actual.visit) points+=1;
    return `Puntos: ${points}`;
  }

  function save(){
    saved[m.id]={l:localInput.value,v:visitInput.value,confirmed};
    localStorage.setItem("prode",JSON.stringify(saved));
    paint();
  }

  function lock(){
    localInput.disabled=true;
    visitInput.disabled=true;
    btn.textContent="Editar";
    btn.classList.add("edit");
  }

  function unlock(){
    localInput.disabled=false;
    visitInput.disabled=false;
    btn.textContent="Confirmar";
    btn.classList.remove("edit");
    localInput.focus();
  }

  btn.onclick=()=>{
    if(!confirmed){
      if(localInput.value==="" || visitInput.value==="") return;
      confirmed=true;
      save();
      lock();
    } else{
      confirmed=false;
      unlock();
      save();
    }
  };

  container.appendChild(div);
}

