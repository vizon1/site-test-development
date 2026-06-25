import { serialize } from 'cookie';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { token } = req.body;
    
    if (!token) return res.status(400).json({ error: 'Token JWT não fornecido' });

    try {
        // Decodifica a Base64 do JWT para ler o email
        const payloadBase64 = token.split('.')[1];
        const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
        const decodedData = JSON.parse(decodedJson);
        
        const emailDoUsuario = decodedData.email;
        const uidDoUsuario = decodedData.user_id;

        // 👇 AQUI ESTÃO OS EMAILS DOS DONOS / ADMINISTRADORES
        const adminEmails = [
            "patricksilvaps017@gmail.com", 
            "contato@guardalarmes.com"
        ];

        if (!adminEmails.includes(emailDoUsuario)) {
            return res.status(403).json({ error: 'Acesso Negado' });
        }

        // Cria o Cookie Seguro (HttpOnly) válido por 8 horas
        const cookie = serialize('guard_admin_token', uidDoUsuario, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 60 * 60 * 8, 
            path: '/'
        });

        res.setHeader('Set-Cookie', cookie);
        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: 'Erro ao validar Token' });
    }
}
