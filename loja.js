/* Carrinho, favoritos, conta e avaliações.
   Por enquanto os dados ficam salvos no navegador de quem visita (localStorage). */
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
const isFav=id=>favoritos.tem(id);
const conta={
 ler:()=>BD.ler("dellas_conta",null),
 salvar:c=>BD.gravar("dellas_conta",c),
 sair(){try{localStorage.removeItem("dellas_conta")}catch(e){}}
};
// Avaliações: para compartilhar entre todos os visitantes, troque estas 3 funções por um banco de dados online.
const avaliacoes={
 listar:id=>(BD.ler("dellas_aval",{})[id]||[]),
 salvar(id,a){const t=BD.ler("dellas_aval",{});t[id]=[a,...(t[id]||[]).filter(x=>x.autor!==a.autor)];BD.gravar("dellas_aval",t);},
 remover(id,autor){const t=BD.ler("dellas_aval",{});t[id]=(t[id]||[]).filter(x=>x.autor!==autor);BD.gravar("dellas_aval",t);}
};

function aviso(html){let t=document.getElementById("aviso");
 if(!t){t=document.createElement("div");t.id="aviso";t.setAttribute("role","status");document.body.appendChild(t);}
 t.innerHTML=html;t.classList.add("on");clearTimeout(aviso.t);aviso.t=setTimeout(()=>t.classList.remove("on"),2800);}

function contadores(){
 [["nFav",favoritos.lista().length],["nCarrinho",carrinho.total()]].forEach(([id,n])=>{
  const e=document.getElementById(id);if(e){e.textContent=n>99?"99+":n;e.hidden=!n;}});
 document.querySelectorAll("[data-fav]").forEach(b=>{const on=favoritos.tem(+b.dataset.fav);
  b.setAttribute("aria-pressed",on);});
}
document.addEventListener("click",e=>{const b=e.target.closest("[data-fav]");if(!b)return;
 e.preventDefault();const on=favoritos.alternar(+b.dataset.fav);
 aviso(on?'Adicionado aos favoritos <a href="favoritos.html">Ver favoritos</a>':"Removido dos favoritos");});

/* Botões "Comprar" e "Adicionar ao carrinho" dos cards.
   Produtos com tons (cor) abrem a página do produto para a pessoa escolher o tom. */
document.addEventListener("click",e=>{const b=e.target.closest("[data-comprar],[data-add]");if(!b)return;
 const comprar=b.hasAttribute("data-comprar"),i=+(comprar?b.dataset.comprar:b.dataset.add),p=P[i];
 if(!p)return;
 if(p.tons){location.href="produto.html?id="+i+"#tons";return;}
 carrinho.add(i,null,1);
 if(comprar){location.href="carrinho.html";return;}
 aviso('Adicionado ao carrinho <a href="carrinho.html">Ver carrinho</a>');});
contadores();
