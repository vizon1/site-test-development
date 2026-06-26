export default function handler(req, res) {
    // Vercel/Next.js já transforma os cookies num objeto fácil de ler
    const tokenAdmin = req.cookies.guard_admin_token;

    // Se o cookie existir na máquina do usuário, ele é admin
    if (tokenAdmin) {
        return res.status(200).json({ isAdmin: true });
    }

    // Se não existir, é um cliente comum
    return res.status(401).json({ isAdmin: false });
}
