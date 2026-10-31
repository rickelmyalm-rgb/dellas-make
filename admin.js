/* Painel da loja: edita o catalogo.js e envia as fotos direto para o repositório do GitHub.
   Precisa de uma chave (token) do GitHub com permissão "Contents: Read and write" só neste repositório. */
(function(){
const API="https://api.github.com";
const el=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const dinheiro=v=>v==null?"Consulte o preço":Number(v).toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
let TOKEN="",REPO="",BRANCH="main",LISTA=[],SHA="",EDIT=null,FOTOS=[],TONS=[];
const PREVIA={};            // fotos recém-enviadas, para aparecer na hora (o site leva 1-2 min para publicar)
const imgUrl=n=>PREVIA[n]||n;

/* ---------- GitHub ---------- */
async function gh(path,opt){
 opt=opt||{};
 const h={"Authorization":"Bearer "+TOKEN,"Accept":"application/vnd.github+json","X-GitHub-Api-Version":"2022-11-28"};
 if(opt.body)h["Content-Type"]="application/json";
 const r=await fetch(API+path,Object.assign({},opt,{headers:h}));
 if(!r.ok){const e=new Error("GitHub "+r.status);e.status=r.status;try{e.detalhe=(await r.json()).message;}catch(x){}throw e;}
 return r.json();
}
const dec=b64=>new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\s/g,"")),c=>c.charCodeAt(0)));
const enc=s=>{let bin="";new TextEncoder().encode(s).forEach(x=>bin+=String.fromCharCode(x));return btoa(bin);};
const gravando=p=>p.catch(e=>{e.etapa="gravar";throw e;});
const put=(caminho,conteudoB64,msg,sha)=>gravando(gh("/repos/"+REPO+"/contents/"+caminho,{method:"PUT",body:JSON.stringify(Object.assign({message:msg,content:conteudoB64,branch:BRANCH},sha?{sha:sha}:{}))}));
// Teste de permissão de escrita (cria só um objeto solto no Git, sem alterar nenhum arquivo do site).
const testarEscrita=()=>gravando(gh("/repos/"+REPO+"/git/blobs",{method:"POST",body:JSON.stringify({content:"teste de permissao",encoding:"utf-8"})}));
function textoErro(e){
 if(e.etapa==="gravar"&&(e.status===401||e.status===403||e.status===404))return "O GitHub não deixou gravar (erro "+e.status+(e.detalhe?": "+e.detalhe:"")+"). A chave consegue LER o site, mas não tem permissão de ESCRITA neste repositório. Crie uma nova em Settings > Developer settings > Fine-grained tokens, escolha só o repositório do site e marque Contents: Read and write (se for uma chave clássica, marque a opção repo).";
 if(e.status===401)return "Chave inválida ou vencida. Crie uma nova no GitHub.";
 if(e.status===403)return "O GitHub recusou: confira se a chave tem permissão de escrita (Contents: Read and write) neste repositório.";
 if(e.status===404)return "Repositório ou arquivo catalogo.js não encontrado"+(e.detalhe?" ("+e.detalhe+")":"")+". Confira o nome do repositório (usuario/repositorio) e se o catalogo.js está na pasta principal do repositório.";
 if(e.status===409||e.status===422)return "O catálogo mudou enquanto você salvava. Tente de novo.";
 if(e.semEscrita)return "Esta chave só lê o repositório. Ela precisa de permissão de escrita (Contents: Read and write).";
 return "Não foi possível falar com o GitHub agora"+(e.detalhe?" ("+e.detalhe+")":"")+". Verifique a internet e tente de novo.";
}
async function carregar(){
 const d=await gh("/repos/"+REPO+"/contents/catalogo.js?ref="+encodeURIComponent(BRANCH));
 SHA=d.sha;
 LISTA=new Function(dec(d.content)+"\nreturn P;")();
}
const CABECALHO='// Catálogo da loja. Este arquivo é atualizado pelo painel (admin.html), mas também pode ser editado à mão.\n// Cada produto: nome, cat, preco (número ou null), desc, imgs (nomes dos arquivos), tons [[nome, cor, nº da foto]],\n// e opcionais: lancamento, esgotado, oculto, tags.\n// NÃO mude a ordem nem apague produtos: o carrinho, os favoritos e as avaliações usam a posição na lista.\n// Para tirar um produto do site, use "oculto":true. Produtos novos entram sempre no final.\n';
const serializar=arr=>CABECALHO+"const P=[\n"+arr.map(p=>JSON.stringify(p)).join(",\n")+"\n];\n";
const slug=s=>(s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"").slice(0,30))||"produto";

/* ---------- mensagens ---------- */
function msg(id,txt,tipo){const m=el(id);if(!txt){m.hidden=true;return;}m.textContent=txt;m.className="adm-msg "+(tipo||"info");m.hidden=false;}

/* ---------- login (usuário e senha pelo Firebase) ---------- */
const DOMINIO="@painel.dellas";   // o login "dellasmakeup10" vira o e-mail dellasmakeup10@painel.dellas no Firebase
let ULTIMO_ERRO="";
function repoPadrao(){
 const salvo=localStorage.getItem("dellas_gh_repo");if(salvo)return salvo;
 const m=location.hostname.match(/^(.+)\.github\.io$/),pasta=location.pathname.split("/")[1];
 return m&&pasta&&!/\.html?$/.test(pasta)?m[1]+"/"+pasta:"";
}
async function conectarGitHub(repo,token){
 TOKEN=token.trim();REPO=repo.trim().replace(/^https?:\/\/github\.com\//,"").replace(/\.git$/,"").replace(/\/+$/,"");
 try{
  const info=await gh("/repos/"+REPO);BRANCH=info.default_branch||"main";
  if(info.permissions&&info.permissions.push===false){const e=new Error("sem escrita");e.semEscrita=true;throw e;}
  await carregar();
  await testarEscrita();
  localStorage.setItem("dellas_gh_repo",REPO);return true;
 }catch(e){TOKEN="";ULTIMO_ERRO=textoErro(e);return false;}
}
function mostrar(qual){["login","setup","painel"].forEach(id=>{el(id).hidden=id!==qual;});el("sair").hidden=qual==="login";el("trocarChave").hidden=qual!=="painel";}
function mostrarPainel(){mostrar("painel");preencherCategorias();render();}
function mostrarSetup(aviso,repo){mostrar("setup");el("sRepo").value=repo||"";el("sToken").value="";el("sErro").textContent=aviso||"";}
function textoErroLogin(e){
 const c=e.code||"";
 if(["auth/invalid-credential","auth/wrong-password","auth/user-not-found","auth/invalid-email"].indexOf(c)>=0)return "Login ou senha incorretos.";
 if(c==="auth/too-many-requests")return "Muitas tentativas. Espere alguns minutos e tente de novo.";
 if(c==="auth/operation-not-allowed")return "Ative o login por e-mail e senha no Firebase (Authentication > Método de login).";
 if(c==="auth/unauthorized-domain")return "Este endereço não está liberado no Firebase (Authentication > Configurações > Domínios autorizados).";
 if(e.message==="sem-firebase")return "O Firebase ainda não está configurado no config.js.";
 if(c==="permission-denied")return "Este usuário não tem permissão de administrador. Confira as regras do Firestore.";
 return "Não foi possível entrar ("+(c||e.message)+").";
}
async function aposLogin(f){
 let seg=null;
 try{const d=await f.fs.getDoc(f.fs.doc(f.db,"segredos","github"));seg=d.exists()?d.data():null;}
 catch(e){if(e.code==="permission-denied")await f.au.signOut(f.auth);throw e;}
 if(seg&&seg.token&&seg.repo){
  if(await conectarGitHub(seg.repo,seg.token)){mostrarPainel();return;}
  mostrarSetup("A chave guardada não funcionou. "+ULTIMO_ERRO+" Cole uma nova.",seg.repo);return;
 }
 mostrarSetup("Primeiro acesso: cole a chave do GitHub. Você só faz isso uma vez.",repoPadrao());
}
async function sair(){try{const f=await fb();await f.au.signOut(f.auth);}catch(e){}TOKEN="";el("lSenha").value="";mostrar("login");}

/* ---------- lista ---------- */
function preencherCategorias(){
 const op=CATEGORIAS.map(c=>'<option value="'+c[0]+'">'+esc(c[1])+'</option>').join("");
 el("pCat").innerHTML=op;el("filtroCat").innerHTML='<option value="">Todas as categorias</option>'+op;
}
const nomeCat=k=>(CATEGORIAS.find(c=>c[0]===k)||[k,k])[1];
function render(){
 const q=el("busca").value.trim().toLowerCase(),cat=el("filtroCat").value;
 const itens=LISTA.map((p,i)=>({p:p,i:i})).filter(x=>(!cat||x.p.cat===cat)&&(!q||x.p.nome.toLowerCase().indexOf(q)>=0));
 el("resumo").textContent=itens.length+" de "+LISTA.length+" produtos";
 el("lista").innerHTML=itens.map(x=>{const p=x.p;
  const selos=(p.lancamento?'<span class="sel">Lançamento</span>':"")+(p.esgotado?'<span class="sel">Esgotado</span>':"")+(p.oculto?'<span class="sel">Oculto</span>':"");
  return '<div class="adm-linha"><img src="'+esc(imgUrl((p.imgs&&p.imgs[0])||"p-em-breve.svg"))+'" alt=""><div><b>'+esc(p.nome)+'</b>'+selos+'<small>'+esc(nomeCat(p.cat))+" · "+dinheiro(p.preco)+'</small></div><button type="button" class="btn vazado" data-i="'+x.i+'" style="cursor:pointer;font-family:var(--sans)">Editar</button></div>';
 }).join("")||'<p class="nota-texto">Nenhum produto encontrado.</p>';
}

/* ---------- editor ---------- */
function abrir(i){
 EDIT=i;const p=i==null?{nome:"",cat:CATEGORIAS[0][0],preco:10,desc:"",imgs:[]}:LISTA[i];
 el("mTitulo").textContent=i==null?"Novo produto":"Editar produto";
 el("pNome").value=p.nome;el("pCat").value=p.cat;el("pPreco").value=p.preco==null?"":p.preco;el("pDesc").value=p.desc||"";
 el("pLanc").checked=!!p.lancamento;el("pEsg").checked=!!p.esgotado;el("pOculto").checked=!!p.oculto;
 FOTOS=(p.imgs||[]).filter(n=>n!=="p-em-breve.svg").map(n=>({nome:n,url:imgUrl(n)}));
 TONS=(p.tons||[]).map(t=>({nome:t[0],cor:t[1],foto:typeof t[2]==="number"?t[2]:""}));
 msg("mMsg","");el("modal").hidden=false;el("pNome").focus();fotos();tons();
}
function fotos(){
 el("pFotos").innerHTML=FOTOS.map((f,k)=>'<div class="foto-adm"><img src="'+esc(f.url)+'" alt="">'+(k===0?'<span class="capa">Capa</span>':"")+'<div class="acoes"><button type="button" data-a="esq" data-k="'+k+'" aria-label="Mover para a esquerda">◀</button><button type="button" data-a="del" data-k="'+k+'" aria-label="Remover foto">✕</button><button type="button" data-a="dir" data-k="'+k+'" aria-label="Mover para a direita">▶</button></div></div>').join("")||'<p class="nota-texto">Nenhuma foto ainda.</p>';
}
function tons(){
 el("pTons").innerHTML=TONS.map((t,k)=>{
  const ops='<option value="">Sem foto</option>'+FOTOS.map((f,j)=>'<option value="'+j+'"'+(String(t.foto)===String(j)?" selected":"")+'>Foto '+(j+1)+'</option>').join("");
  return '<div class="tom-adm"><input data-t="nome" data-k="'+k+'" value="'+esc(t.nome)+'" placeholder="Nome (ex.: 01)" maxlength="30"><input type="color" data-t="cor" data-k="'+k+'" value="'+esc(t.cor||"#880E1A")+'"><select data-t="foto" data-k="'+k+'">'+ops+'</select><button type="button" class="rem" data-t="del" data-k="'+k+'">Remover</button></div>';
 }).join("");
}
function moverFoto(k,d){
 const j=k+d;if(j<0||j>=FOTOS.length)return;
 const tmp=FOTOS[k];FOTOS[k]=FOTOS[j];FOTOS[j]=tmp;
 TONS.forEach(t=>{if(t.foto===k)t.foto=j;else if(t.foto===j)t.foto=k;});
}
function removerFoto(k){
 FOTOS.splice(k,1);
 TONS.forEach(t=>{if(t.foto===k)t.foto="";else if(typeof t.foto==="number"&&t.foto>k)t.foto=t.foto-1;});
}
async function comprimir(arq){
 const bmp=await createImageBitmap(arq);
 const esc2=Math.min(1,1100/Math.max(bmp.width,bmp.height));
 const c=document.createElement("canvas");c.width=Math.round(bmp.width*esc2);c.height=Math.round(bmp.height*esc2);
 c.getContext("2d").drawImage(bmp,0,0,c.width,c.height);
 let url=c.toDataURL("image/webp",0.8),ext="webp";
 if(url.indexOf("data:image/webp")!==0){url=c.toDataURL("image/jpeg",0.85);ext="jpg";}
 return {url:url,b64:url.split(",")[1],ext:ext};
}
async function salvar(e){
 e.preventDefault();
 const nome=el("pNome").value.trim();if(!nome)return;
 const bt=el("salvar");bt.disabled=true;msg("mMsg","Publicando… não feche esta janela.","info");
 try{
  await carregar();                                  // pega a versão mais recente do catálogo
  const nomes=[];let n=0;
  for(const f of FOTOS){
   if(f.b64){const arq="p-"+slug(nome)+"-"+Date.now().toString(36)+(n++)+"."+f.ext;
    await put(arq,f.b64,"Painel: foto de "+nome);PREVIA[arq]=f.url;nomes.push(arq);}
   else nomes.push(f.nome);
  }
  const antigo=EDIT==null?{}:(LISTA[EDIT]||{});
  const preco=el("pPreco").value;
  const prod=Object.assign({},antigo,{nome:nome,cat:el("pCat").value,preco:preco===""?null:Number(preco),desc:el("pDesc").value.trim(),imgs:nomes.length?nomes:["p-em-breve.svg"]});
  const tt=TONS.filter(t=>t.nome.trim()).map(t=>t.foto===""?[t.nome.trim(),t.cor]:[t.nome.trim(),t.cor,Number(t.foto)]);
  if(tt.length)prod.tons=tt;else delete prod.tons;
  [["lancamento","pLanc"],["esgotado","pEsg"],["oculto","pOculto"]].forEach(x=>{if(el(x[1]).checked)prod[x[0]]=true;else delete prod[x[0]];});
  if(EDIT==null)LISTA.push(prod);else LISTA[EDIT]=prod;
  await put("catalogo.js",enc(serializar(LISTA)),"Painel: "+(EDIT==null?"novo produto ":"atualiza ")+nome,SHA);
  await carregar();render();el("modal").hidden=true;
  msg("msgGeral","Publicado! A mudança aparece no site em 1 a 2 minutos (atualize a página com Ctrl + F5).","ok");
  window.scrollTo(0,0);
 }catch(err){console.error(err);msg("mMsg",textoErro(err),"erro");}
 bt.disabled=false;
}

/* ---------- eventos ---------- */
el("fLogin").addEventListener("submit",async e=>{e.preventDefault();el("lErro").textContent="";const b=el("lEntrar");b.disabled=true;
 try{
  if(typeof FIREBASE_CONFIG==="undefined"||!FIREBASE_CONFIG)throw new Error("sem-firebase");
  const f=await fb();
  await f.au.signInWithEmailAndPassword(f.auth,el("lUser").value.trim().toLowerCase()+DOMINIO,el("lSenha").value);
  await aposLogin(f);
 }catch(err){console.error(err);el("lErro").textContent=textoErroLogin(err);}
 b.disabled=false;});
el("fSetup").addEventListener("submit",async e=>{e.preventDefault();el("sErro").textContent="";const b=el("sSalvar");b.disabled=true;
 if(await conectarGitHub(el("sRepo").value,el("sToken").value)){
  try{const f=await fb();await f.fs.setDoc(f.fs.doc(f.db,"segredos","github"),{repo:REPO,token:TOKEN});mostrarPainel();}
  catch(err){console.error(err);el("sErro").textContent="Não consegui guardar a chave no Firebase ("+(err.code||err.message)+"). Confira as regras do Firestore.";}
 }else el("sErro").textContent=ULTIMO_ERRO;
 b.disabled=false;});
el("sair").onclick=sair;
el("trocarChave").onclick=()=>mostrarSetup("Cole a nova chave do GitHub.",REPO);
el("busca").addEventListener("input",render);el("filtroCat").addEventListener("change",render);
el("novo").onclick=()=>abrir(null);
el("lista").addEventListener("click",e=>{const b=e.target.closest("[data-i]");if(b)abrir(+b.dataset.i);});
el("cancelar").onclick=()=>{el("modal").hidden=true;};
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!el("modal").hidden)el("modal").hidden=true;});
el("fProd").addEventListener("submit",salvar);
el("pArq").addEventListener("change",async e=>{
 const arqs=Array.from(e.target.files);e.target.value="";
 msg("mMsg","Preparando as fotos…","info");
 try{for(const a of arqs){const c=await comprimir(a);FOTOS.push({nome:null,url:c.url,b64:c.b64,ext:c.ext});}msg("mMsg","");}
 catch(err){console.error(err);msg("mMsg","Não consegui ler uma das fotos. Tente outro arquivo (JPG, PNG ou WEBP).","erro");}
 fotos();tons();
});
el("pFotos").addEventListener("click",e=>{const b=e.target.closest("button");if(!b)return;const k=+b.dataset.k;
 if(b.dataset.a==="del")removerFoto(k);else moverFoto(k,b.dataset.a==="esq"?-1:1);fotos();tons();});
el("addTom").onclick=()=>{TONS.push({nome:"",cor:"#c9a27a",foto:""});tons();};
el("pTons").addEventListener("input",e=>{const t=e.target.dataset.t;if(!t)return;TONS[+e.target.dataset.k][t]=e.target.value;});
el("pTons").addEventListener("change",e=>{const t=e.target.dataset.t;if(t!=="foto")return;const v=e.target.value;TONS[+e.target.dataset.k].foto=v===""?"":Number(v);});
el("pTons").addEventListener("click",e=>{const b=e.target.closest("button");if(b&&b.dataset.t==="del"){TONS.splice(+b.dataset.k,1);tons();}});

/* ---------- início ---------- */
(async()=>{
 try{
  if(typeof FIREBASE_CONFIG==="undefined"||!FIREBASE_CONFIG)return;
  const u=await fbUsuario(false);
  if(u&&u.email&&u.email.endsWith(DOMINIO)){el("login").hidden=true;await aposLogin(await fb());}
 }catch(e){console.error(e);mostrar("login");}
})();
})();
