import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Pega o token JWT enviado pelo Front-end
    const { token } = req.body;
    
    // (Em um ambiente de produção rigoroso, decodificaríamos o JWT com a biblioteca jose
    // ou Firebase Admin. Para a rapidez e infraestrutura Serverless, vamos simplificar).
    
    // Decodifica a Base64 do JWT (A segunda parte do token tem os dados do usuário)
    const payloadBase64 = token.split('.')[1];
    const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
    const decodedData = JSON.parse(decodedJson);
    
    const emailDoUsuario = decodedData.email;
    const uidDoUsuario = decodedData.user_id;

    // COLOQUE AQUI O SEU EMAIL DE ADMINISTRADOR! 
    const adminEmails = ["patricksilvaps017@gmail.com", "contato@guardalarmes.com"];

    if (!adminEmails.includes(emailDoUsuario)) {
        return res.status(403).json({ error: 'Acesso Negado' });
    }

    // Cria um cookie incopíavel via JavaScript (HttpOnly) e válido por 8 horas
    const cookie = serialize('guard_admin_token', uidDoUsuario, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 horas
        path: '/'
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true });
}
