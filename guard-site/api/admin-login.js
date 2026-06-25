import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    // Aqui você recebe o UID do Firebase ou Email que a pessoa usou para logar
    const { email, uid } = req.body;

    // COLOQUE AQUI O SEU EMAIL DE ADMINISTRADOR! 
    // Só vai gerar o token se o email que logou for o seu.
    const adminEmails = ["seuemail@gmail.com", "contato@guardalarmes.com"];

    if (!adminEmails.includes(email)) {
        return res.status(403).json({ error: 'Acesso Negado' });
    }

    // Cria um cookie incopíavel via JavaScript (HttpOnly) e válido por 8 horas
    const cookie = serialize('guard_admin_token', uid, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 8, // 8 horas
        path: '/'
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true });
}
