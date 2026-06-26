export default function handler(req, res) {
    // Tenta ler os cookies interpretados ou faz o mapeamento manual
    const cookies = req.cookies || {};
    let tokenAdmin = cookies.guard_admin_token;

    if (!tokenAdmin && req.headers.cookie) {
        const rawCookies = req.headers.cookie.split(';');
        const parsedCookie = rawCookies.find(c => c.trim().startsWith('guard_admin_token='));
        if (parsedCookie) {
            tokenAdmin = parsedCookie.split('=')[1];
        }
    }

    // Se o token existir no navegador do usuário, confirma o acesso de administrador
    if (tokenAdmin) {
        return res.status(200).json({ isAdmin: true });
    }

    return res.status(401).json({ isAdmin: false });
}
