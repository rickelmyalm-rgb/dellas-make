// Ajudantes do site. Os produtos ficam no catalogo.js; WhatsApp, cidades e Firebase ficam no config.js.

// Categorias da loja (usadas no menu lateral e no painel). Para criar uma nova, acrescente aqui.
const CATEGORIAS=[["base","Base"],["corretivo","Corretivo"],["po","Pó"],["blush","Blush"],["iluminador","Iluminador"],["labios","Lábios"],["cilios","Cílios"],["sobrancelha","Sobrancelha"],["esponjas","Kits"],["skincare","Skincare"],["bodysplash","Body Splash"],["blindagem","Blindagem"]];
const visivel=i=>!!P[i]&&!P[i].oculto;

const $=id=>document.getElementById(id);
const brl=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const CORACAO='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>';
function cartao(i){const p=P[i],l="produto.html?id="+i,f=typeof isFav==="function"&&isFav(i),escolher=p.tons&&p.tons.length>1;
 const valor=p.preco!=null?`<p class="valor"><b class="preco">${brl(p.preco)}</b><span class="pix">à vista (Pix ou dinheiro)</span></p>`:`<p class="valor"><span class="pix">Consulte o preço</span></p>`;
 const botao=p.esgotado?`<button type="button" class="btn-card" disabled>Esgotado</button>`:escolher?`<a class="btn-card alt" href="${l}">Escolher tom</a>`:`<button type="button" class="btn-card" data-add="${i}">Adicionar ao carrinho</button>`;
 return `<article class="card"><a class="img" href="${l}"><img src="${p.imgs[0]}" alt="${p.nome}" loading="lazy"${p.pos?` style="object-position:${p.pos}"`:""}></a><button type="button" class="fav" data-fav="${i}" aria-pressed="${f}" aria-label="Favoritar ${p.nome}">${CORACAO}</button><h3><a href="${l}">${p.nome}</a></h3>${valor}${botao}</article>`;}

// ===== Busca =====
const BUSCA_EXTRA={base:"base maquiagem",corretivo:"corretivo concealer",po:"po",blush:"blush",iluminador:"iluminador",cilios:"",sobrancelha:"sobrancelha gel",esponjas:"esponja esponjas kit puff piranha garra",skincare:"skincare limpeza cuidado pele hidratante micelar agua demaquilante",blindagem:"blindagem fixador",labios:"gloss brilho lapis contorno labios batom",bodysplash:"body splash perfume fragrancia corpo lady beauty al hayat"};
const norm=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function buscar(termo){const ws=norm(termo).split(/\s+/).filter(Boolean);
 return P.map((p,i)=>i).filter(visivel).filter(i=>{const toks=norm(P[i].nome+" "+P[i].desc+" "+(BUSCA_EXTRA[P[i].cat]||"")+" "+(P[i].tags||"")).split(/[^a-z0-9]+/);
  return ws.every(w=>toks.some(t=>t.startsWith(w)));});}
