export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { token } = req.body;
    if (!token) return res.status(400).json({ error: 'Token JWT não fornecido' });

    try {
        // Decodifica a Base64 do JWT para ler o email validado pelo Google
        const payloadBase64 = token.split('.')[1];
        const decodedJson = Buffer.from(payloadBase64, 'base64').toString();
        const decodedData = JSON.parse(decodedJson);
        
        const emailDoUsuario = decodedData.email;
        const uidDoUsuario = decodedData.user_id;

        // 👇 AQUI ESTÃO OS EMAILS DOS ADMINISTRADORES
        const adminEmails = [
            "patricksilvaps017@gmail.com", 
            "tick155t@gmail.com",
            "guardlojaonline@gmail.com"
        ];

        if (!adminEmails.includes(emailDoUsuario)) {
            return res.status(403).json({ error: 'Acesso Negado' });
        }

        // Cria a trava de segurança do Cookie nativamente
        const isProd = process.env.NODE_ENV === 'production';
        const cookieString = `guard_admin_token=${uidDoUsuario}; Path=/; Max-Age=${60 * 60 * 8}; HttpOnly; SameSite=Strict${isProd ? '; Secure' : ''}`;

        res.setHeader('Set-Cookie', cookieString);
        return res.status(200).json({ success: true });

    } catch (error) {
        return res.status(500).json({ error: 'Erro ao validar Token' });
    }
}
