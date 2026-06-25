export default function handler(req, res) {
    // Destrói o cookie definindo a data de validade para o passado
    const isProd = process.env.NODE_ENV === 'production';
    const cookieString = `guard_admin_token=; Path=/; Max-Age=-1; HttpOnly; SameSite=Strict${isProd ? '; Secure' : ''}`;

    res.setHeader('Set-Cookie', cookieString);
    return res.status(200).json({ success: true });
}
