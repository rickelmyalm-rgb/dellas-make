// ===== Dados da loja =====
const WHATSAPP="5511978373595";  // WhatsApp da loja com código do país e DDD, só números. Ex.: "5586999999999"
const CIDADES=["São João do Piauí","Capitão Gervásio Oliveira","Santa Rita","Canto do Buriti"];

// Lista de produtos da loja. Para trocar nome, preço, descrição ou fotos, edite aqui.
// preco: número (ex.: 29.9) ou null para mostrar "Consulte o preço". Hoje todos custam 10.
// imgs: nomes dos arquivos de foto (na mesma pasta do site).
// tons: [nome, cor, número da foto (opcional)]. Ao escolher o tom, a foto indicada aparece (0 = primeira).
const P=[
{nome:"Base Love Rain",cat:"base",preco:10,desc:"Base mate que cobre tudo. Disponível nos tons 01 a 06.",imgs:["p-base.webp"],tons:[["01","#e3b690"],["02","#d8aa82"],["03","#cf9f75"],["04","#c3925f"],["05","#b78a5a"],["06","#a87c52"]]},
{nome:"Gloss",cat:"gloss",preco:10,desc:"Gloss labial Oh Lip! com brilho cintilante e chaveiro de donut e biscoito.",imgs:["p-gloss-rosa.webp","p-gloss-cobre.webp","p-gloss-vitrine.webp"],tons:[["Rosa","#d98ea0",0],["Cobre","#b87a50",1]]},
{nome:"Espuma de Limpeza",cat:"skincare",preco:10,desc:"Espuma de limpeza para rosto e corpo, de textura leve, com aloe vera.",imgs:["p-espuma.webp"]},
{nome:"Gel de Sobrancelha",cat:"sobrancelha",preco:10,desc:"Gel que modela e fixa os fios da sobrancelha, com aplicador prático.",imgs:["p-gel-1.webp","p-gel-2.webp"]},
{nome:"Máscara de Cílios",cat:"cilios",preco:10,desc:"Máscara de cílios 2 em 1: gire a ponta para escolher o volume desejado. Volume intenso e alongador.",imgs:["p-mascara.webp"]},
{nome:"Corretivo",cat:"corretivo",preco:10,desc:"Corretivo líquido (concealer).",imgs:["p-corretivo-1.webp","p-corretivo-2.webp"]},
{nome:"Kit de Esponja",cat:"esponjas",preco:10,desc:"Kit com esponjas de maquiagem em vários formatos e puffs para pó.",imgs:["p-kit-esponja-1.webp"],pos:"30% 50%"},
{nome:"Kit Piranha",cat:"esponjas",preco:10,desc:"Kit com esponja, puff de veludo e piranha (garra de cabelo) em formato de flor, em várias cores.",imgs:["p-kit-esponja-2.webp"]},
{nome:"Blindagem",cat:"blindagem",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]},
{nome:"Pó compacto",cat:"po",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]},
{nome:"Pó solto",cat:"po",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]},
{nome:"Blush",cat:"blush",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]},
{nome:"Iluminador",cat:"iluminador",preco:10,desc:"Foto e detalhes em breve.",imgs:["p-em-breve.svg"]}
];
const $=id=>document.getElementById(id);
const brl=v=>v.toLocaleString("pt-BR",{style:"currency",currency:"BRL"});
const CORACAO='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/></svg>';
function cartao(i){const p=P[i],l="produto.html?id="+i,f=typeof isFav==="function"&&isFav(i);
 return `<article class="card"><a class="img" href="${l}"><img src="${p.imgs[0]}" alt="${p.nome}" loading="lazy"${p.pos?` style="object-position:${p.pos}"`:""}></a><button type="button" class="fav" data-fav="${i}" aria-pressed="${f}" aria-label="Favoritar ${p.nome}">${CORACAO}</button><h3><a href="${l}">${p.nome}</a></h3>${p.preco!=null?`<span class="preco">${brl(p.preco)}</span><span class="pix">à vista (Pix ou dinheiro)</span>`:`<span class="pix">Consulte o preço</span>`}<div class="cbtns"><button type="button" class="btn" data-comprar="${i}" aria-label="Comprar ${p.nome}">Comprar</button><button type="button" class="btn vazado" data-add="${i}" aria-label="Adicionar ${p.nome} ao carrinho">Adicionar ao carrinho</button></div></article>`;}
