/* MODELO do config.js. Se o seu config.js estiver com problema, apague tudo dentro dele,
   cole este conteúdo e, no lugar da linha "const FIREBASE_CONFIG=null;", cole o bloco abaixo
   (SÓ o bloco, sem as linhas "import" e sem "initializeApp"):

   const FIREBASE_CONFIG = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     storageBucket: "...",
     messagingSenderId: "...",
     appId: "..."
   };
*/

// WhatsApp da loja com código do país e DDD, só números.
const WHATSAPP="5511978373595";

// Cidades atendidas (aparecem no pedido e na conta).
const CIDADES=["São João do Piauí","Capitão Gervásio Oliveira","Santa Rita","Canto do Buriti"];

// Firebase (avaliações). Enquanto estiver null, as avaliações ficam salvas só no aparelho de quem avaliou.
const FIREBASE_CONFIG=null;
