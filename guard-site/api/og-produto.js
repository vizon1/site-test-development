import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_API_KEY || "AIzaSyBLDntUspio2er8xe71wOCyObbYa-HaH20",
    authDomain: "loja-guard.firebaseapp.com",
    projectId: "loja-guard"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default async function handler(req, res) {
    const { id } = req.query;

    if (!id) {
        return res.redirect(301, '/store'); // Se não tiver ID, manda pra loja
    }

    try {
        const docRef = doc(db, "produtos", id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            return res.redirect(301, '/store');
        }

        const produto = docSnap.data();
        const urlBase = `https://${req.headers.host}`;

        // GERA O HTML FALSO APENAS PARA O ROBÔ DO WHATSAPP/FACEBOOK LER
        const html = `
            <!DOCTYPE html>
            <html lang="pt-br">
            <head>
                <meta charset="UTF-8">
                <title>${produto.titulo} - Guard Store</title>
                
                <meta property="og:type" content="product">
                <meta property="og:title" content="${produto.titulo} | Guard Store">
                <meta property="og:description" content="R$ ${produto.preco} - ${produto.descricao ? produto.descricao.substring(0, 100) + '...' : 'Equipamento de segurança de alta qualidade.'}">
                <meta property="og:image" content="${produto.imagem}">
                <meta property="og:url" content="${urlBase}/produto?id=${id}">
                <meta property="og:site_name" content="Guard Store">
                
                <meta name="twitter:card" content="summary_large_image">
                <meta name="twitter:title" content="${produto.titulo}">
                <meta name="twitter:description" content="Confira este equipamento de segurança na Guard Store.">
                <meta name="twitter:image" content="${produto.imagem}">

                <meta http-equiv="refresh" content="0;url=/produto?id=${id}">
                
                <script>
                    window.location.href = "/produto?id=${id}";
                </script>
            </head>
            <body style="background:#000; color:#fff; font-family:sans-serif; text-align:center; padding-top:50px;">
                <p>Redirecionando para o produto...</p>
            </body>
            </html>
        `;

        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        // Cache na borda (CDN) por 1 hora para o WhatsApp não ficar batendo no banco de dados
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate'); 
        res.status(200).send(html);

    } catch (error) {
        console.error("Erro ao gerar OG:", error);
        return res.redirect(301, '/store');
    }
}
