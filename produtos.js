// ===== Dados da loja =====
const WHATSAPP="5511978373595";  // WhatsApp da loja com código do país e DDD, só números. Ex.: "5586999999999"
const CIDADES=["São João do Piauí","Capitão Gervásio Oliveira","Santa Rita","Canto do Buriti"];

// Lista de produtos da loja. Para trocar nome, preço, descrição ou fotos, edite aqui.
// preco: número (ex.: 29.9) ou null para mostrar "Consulte o preço". Hoje todos custam 10.
// lancamento:true faz o produto aparecer em "Lançamentos"; oferta:true faz aparecer em "Ofertas".
// imgs: nomes dos arquivos de foto (na mesma pasta do site).
// tons: [nome, cor, número da foto (opcional)]. Ao escolher o tom, a foto indicada aparece (0 = primeira).
const P=[
{nome:"Base Love Rain",cat:"base",preco:10,desc:"Base mate que cobre tudo. Disponível nos tons 01 a 06.",imgs:["p-base.webp"],tons:[["01","#e3b690"],["02","#d8aa82"],["03","#cf9f75"],["04","#c3925f"],["05","#b78a5a"],["06","#a87c52"]]},
{nome:"Gloss",cat:"gloss",lancamento:true,preco:10,desc:"Gloss labial Oh Lip! com brilho cintilante e chaveiro de donut e biscoito.",imgs:["p-gloss-rosa.webp","p-gloss-cobre.webp","p-gloss-vitrine.webp"],tons:[["Rosa","#d98ea0",0],["Cobre","#b87a50",1]]},
{nome:"Espuma de Limpeza",cat:"skincare",preco:10,desc:"Espuma de limpeza para rosto e corpo, de textura leve, com aloe vera.",imgs:["p-espuma.webp"]},
{nome:"Gel de Sobrancelha",cat:"sobrancelha",preco:10,desc:"Gel que modela e fixa os fios da sobrancelha, com aplicador prático.",imgs:["p-gel-1.webp","p-gel-2.webp"]},
{nome:"Máscara de Cílios Febella",cat:"cilios",preco:10,desc:"Máscara de cílios 2 em 1: gire a ponta para escolher o volume desejado. Volume intenso e alongador.",imgs:["p-mascara.webp"]},
{nome:"Corretivo",cat:"corretivo",preco:10,desc:"Corretivo líquido (concealer). Disponível em 6 tons.",imgs:["p-corretivo-1.webp","p-corretivo-2.webp"],tons:[["01","#bfa284"],["02","#c29f7b"],["03","#bb9870"],["04","#c29b71"],["05","#b38554"],["06","#9c6d39"]]},
{nome:"Kit de Esponja",cat:"esponjas",preco:10,desc:"Kit com esponjas de maquiagem em vários formatos e puffs para pó.",imgs:["p-kit-esponja-1.webp"],pos:"30% 50%"},
{nome:"Kit Piranha",cat:"esponjas",lancamento:true,preco:10,desc:"Kit com esponja, puff de veludo e piranha (garra de cabelo) em formato de flor, em várias cores.",imgs:["p-kit-esponja-2.webp"]},
{nome:"Blindagem PlayBoy",cat:"blindagem",preco:10,desc:"Blindagem de 15 ml com fixação extrema, para uma maquiagem resistente à água e de alta durabilidade.",imgs:["p-blindagem.webp"]},
{nome:"Pó compacto",cat:"po",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]},
{nome:"Pó Solto Rosa Dapop",cat:"po",preco:10,desc:"Pó solto ultrafino (15 g) com óleo de rosa mosqueta. Controla o brilho, disfarça imperfeições e protege a pele contra radicais livres.",imgs:["p-po-solto.webp"]},
{nome:"Blush",cat:"blush",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]},
{nome:"Iluminador",cat:"iluminador",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]},
{nome:"Máscara de Cílios Love Rain",cat:"cilios",preco:10,desc:"Máscara de cílios The Huge Lash Power.",imgs:["p-mascara-loverain.webp"]},
{nome:"Base Líquida Briá Beauty",cat:"base",preco:10,desc:"Base líquida oil free (25 g) com rosa mosqueta, chá verde e vitamina E. Disponível em 3 tons.",imgs:["p-base-bria.webp"],tons:[["01","#f5a279"],["02","#e48a59"],["03","#d88048"]]}
];
const $=id=>document.getElementById(id);
const brl=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const CORACAO='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>';
function cartao(i){const p=P[i],l="produto.html?id="+i,f=typeof isFav==="function"&&isFav(i),escolher=p.tons&&p.tons.length>1;
 const valor=p.preco!=null?`<p class="valor"><b class="preco">${brl(p.preco)}</b><span class="pix">à vista (Pix ou dinheiro)</span></p>`:`<p class="valor"><span class="pix">Consulte o preço</span></p>`;
 const botao=escolher?`<a class="btn-card alt" href="${l}">Escolher tom</a>`:`<button type="button" class="btn-card" data-add="${i}">Adicionar ao carrinho</button>`;
 return `<article class="card"><a class="img" href="${l}"><img src="${p.imgs[0]}" alt="${p.nome}" loading="lazy"${p.pos?` style="object-position:${p.pos}"`:""}></a><button type="button" class="fav" data-fav="${i}" aria-pressed="${f}" aria-label="Favoritar ${p.nome}">${CORACAO}</button><h3><a href="${l}">${p.nome}</a></h3>${valor}${botao}</article>`;}

// ===== Busca =====
const BUSCA_EXTRA={base:"base maquiagem",corretivo:"corretivo concealer",po:"po",blush:"blush",iluminador:"iluminador",gloss:"gloss brilho labial",cilios:"rimel mascara cilios",sobrancelha:"sobrancelha gel",esponjas:"esponja esponjas kit puff piranha garra",skincare:"skincare limpeza cuidado pele",blindagem:"blindagem fixador"};
const norm=s=>String(s).normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function buscar(termo){const ws=norm(termo).split(/\s+/).filter(Boolean);
 return P.map((p,i)=>i).filter(i=>{const toks=norm(P[i].nome+" "+P[i].desc+" "+(BUSCA_EXTRA[P[i].cat]||"")).split(/[^a-z0-9]+/);
  return ws.every(w=>toks.some(t=>t.startsWith(w)));});}
