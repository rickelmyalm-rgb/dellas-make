/* Carrinho, favoritos, conta e avaliações.
   Por enquanto os dados ficam salvos no navegador de quem visita (localStorage). */
// Valores padrão: o site continua funcionando mesmo se o config.js estiver com erro ou não carregar.
const LOJA={
 whatsapp:typeof WHATSAPP!=="undefined"?WHATSAPP:"5511978373595",
 cidades:typeof CIDADES!=="undefined"?CIDADES:["São João do Piauí","Capitão Gervásio Oliveira","Santa Rita","Canto do Buriti"]
};
if(typeof WHATSAPP==="undefined"||typeof CIDADES==="undefined")console.warn("config.js não foi carregado (ou tem erro): usando valores padrão. Confira o arquivo config.js.");
const BD={
 ler(k,d){try{const v=JSON.parse(localStorage.getItem(k));return v==null?d:v}catch(e){return d}},
 gravar(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const estrelas=n=>"★".repeat(n)+"☆".repeat(5-n);

const carrinho={
 itens:()=>BD.ler("dellas_carrinho",[]),
 salvar(l){BD.gravar("dellas_carrinho",l);contadores();},
 add(id,tom,qtd){const l=carrinho.itens(),x=l.find(i=>i.id===id&&i.tom===tom);
  if(x)x.qtd=Math.min(20,x.qtd+qtd);else l.push({id,tom,qtd});carrinho.salvar(l);},
 total:()=>carrinho.itens().reduce((s,i)=>s+i.qtd,0)
};
const favoritos={
 lista:()=>BD.ler("dellas_fav",[]),
 tem:id=>favoritos.lista().includes(id),
 alternar(id){let l=favoritos.lista();l=l.includes(id)?l.filter(x=>x!==id):[...l,id];BD.gravar("dellas_fav",l);contadores();return l.includes(id);}
};
const pedidos={
 lista:()=>BD.ler("dellas_pedidos",[]),
 adicionar(p){const l=pedidos.lista();l.unshift(p);BD.gravar("dellas_pedidos",l.slice(0,50));},
 limpar(uid){BD.gravar("dellas_pedidos",pedidos.lista().filter(p=>p.uid!==uid));}
};
const isFav=id=>favoritos.tem(id);
const conta={
 ler:()=>BD.ler("dellas_conta",null),
 salvar:c=>{const ok=BD.gravar("dellas_conta",c);saudacao();return ok;},
 sair(){try{localStorage.removeItem("dellas_conta")}catch(e){}saudacao();}
};
// Avaliações. Com FIREBASE_CONFIG preenchido (em produtos.js) elas ficam no Firebase e aparecem para todos;
// sem ele, ficam salvas só no aparelho de quem avaliou.
const FB_VERSAO="10.12.2";
let _fb=null;
async function fb(){
 if(_fb)return _fb;
 const u="https://www.gstatic.com/firebasejs/"+FB_VERSAO+"/";
 const [a,au,fs]=await Promise.all([import(u+"firebase-app.js"),import(u+"firebase-auth.js"),import(u+"firebase-firestore.js")]);
 const app=a.initializeApp(FIREBASE_CONFIG);
 _fb={au,fs,auth:au.getAuth(app),db:fs.getFirestore(app)};return _fb;
}
async function fbUsuario(entrar){
 const f=await fb();
 let u=await new Promise(r=>{const off=f.au.onAuthStateChanged(f.auth,x=>{off();r(x);});});
 if(!u&&entrar)u=(await f.au.signInAnonymously(f.auth)).user;
 return u;
}
const nuvem=typeof FIREBASE_CONFIG!=="undefined"&&!!FIREBASE_CONFIG;
const avaliacoes={
 nuvem,
 async meuId(){
  if(!nuvem){const c=conta.ler();return c?c.uid:null;}
  try{const u=await fbUsuario(false);return u?u.uid:null;}catch(e){return null;}
 },
 async listar(id){
  if(!nuvem)return BD.ler("dellas_aval",{})[id]||[];
  const f=await fb();
  const s=await f.fs.getDocs(f.fs.query(f.fs.collection(f.db,"avaliacoes"),f.fs.where("produto","==",String(id))));
  return s.docs.map(d=>{const x=d.data();return{autor:x.uid,nome:x.nome,nota:x.nota,texto:x.texto,data:x.data,t:x.criadoEm&&x.criadoEm.toMillis?x.criadoEm.toMillis():0};}).sort((a,b)=>b.t-a.t);
 },
 async salvar(id,a){
  if(!nuvem){const t=BD.ler("dellas_aval",{});t[id]=[a,...(t[id]||[]).filter(x=>x.autor!==a.autor)];BD.gravar("dellas_aval",t);return;}
  const f=await fb(),u=await fbUsuario(true);
  await f.fs.setDoc(f.fs.doc(f.db,"avaliacoes",id+"_"+u.uid),{produto:String(id),uid:u.uid,nome:a.nome,nota:a.nota,texto:a.texto,data:a.data,criadoEm:f.fs.serverTimestamp()});
 },
 async remover(id,autor){
  if(!nuvem){const t=BD.ler("dellas_aval",{});t[id]=(t[id]||[]).filter(x=>x.autor!==autor);BD.gravar("dellas_aval",t);return;}
  const f=await fb(),u=await fbUsuario(true);
  await f.fs.deleteDoc(f.fs.doc(f.db,"avaliacoes",id+"_"+u.uid));
 }
};

function aviso(html){let t=document.getElementById("aviso");
 if(!t){t=document.createElement("div");t.id="aviso";t.setAttribute("role","status");document.body.appendChild(t);}
 t.innerHTML=html;t.classList.add("on");clearTimeout(aviso.t);aviso.t=setTimeout(()=>t.classList.remove("on"),2800);}

const uidAtual=()=>(conta.ler()||{}).uid||"visitante";
function saudacao(){const a=document.querySelector('.acoes a[href="conta.html"]');if(!a)return;
 const c=conta.ler();let s=a.querySelector(".ola");
 if(c){const n=c.nome.split(" ")[0];if(!s){s=document.createElement("span");s.className="ola";a.appendChild(s);}
  s.textContent=n;a.classList.add("logada");a.title="Olá, "+n+"! Minha conta";a.setAttribute("aria-label","Minha conta de "+n);}
 else{if(s)s.remove();a.classList.remove("logada");a.removeAttribute("title");a.setAttribute("aria-label","Minha conta");}}
function contadores(){
 saudacao();
 [["nFav",favoritos.lista().length],["nCarrinho",carrinho.total()]].forEach(([id,n])=>{
  const e=document.getElementById(id);if(e){e.textContent=n>99?"99+":n;e.hidden=!n;}});
 document.querySelectorAll("[data-fav]").forEach(b=>{const on=favoritos.tem(+b.dataset.fav);
  b.setAttribute("aria-pressed",on);const s=b.querySelector("span");if(s)s.textContent=on?"Favoritado":"Favoritar";});
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-fav]");if(!b)return;
 e.preventDefault();const on=favoritos.alternar(+b.dataset.fav);
 aviso(on?'Adicionado aos favoritos <a href="favoritos.html">Ver favoritos</a>':"Removido dos favoritos");});
document.addEventListener("click",e=>{const b=e.target.closest("[data-add]");if(!b)return;
 carrinho.add(+b.dataset.add,null,1);aviso('Adicionado ao carrinho <a href="carrinho.html">Ver carrinho</a>');});
contadores();
