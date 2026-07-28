// api/check-admin.js (Código Seguro e Corrigido)
import admin from 'firebase-admin';

// 1. Inicializa o Admin SDK (apenas uma vez)
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Corrige a formatação da chave privada (quebra de linha)
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            }),
            databaseURL: `https://${process.env.FIREBASE_PROJECT_ID}.firebaseio.com`
        });
    } catch (error) {
        console.error('Erro na inicialização do Firebase Admin:', error);
    }
}

const db = admin.firestore();
const auth = admin.auth();

export default async function handler(req, res) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Método não permitido' });

    // 2. Extrai o Token do Firebase dos Cookies
    const cookies = req.cookies || {};
    let firebaseToken = cookies.guard_admin_token;

    if (!firebaseToken) return res.status(401).json({ isAdmin: false, error: 'Token não fornecido' });

    try {
        // 3. Valida o Token com o Google (Verifica se ele expirou ou é falso)
        const decodedToken = await auth.verifyIdToken(firebaseToken);
        const uid = decodedToken.uid;

        // 4. Validação pelo BANCO DE DADOS (Firestore)
        const docRef = db.collection('usuarios').doc(uid);
        const docSnap = await docRef.get();

        if (docSnap.exists && docSnap.data().isAdmin === true) {
            // Acesso Confirmado: É um admin real e validado pelo banco.
            return res.status(200).json({ isAdmin: true, uid: uid });
        } else {
            // É um usuário logado, mas não é administrador no banco de dados.
            return res.status(403).json({ isAdmin: false, error: 'Acesso negado: Não é administrador' });
        }

    } catch (error) {
        console.error('Erro na verificação do token:', error);
        return res.status(401).json({ isAdmin: false, error: 'Token inválido ou expirado' });
    }
}
