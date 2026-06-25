import { serialize } from 'cookie';

export default function handler(req, res) {
    // Destrói o cookie definindo a data de validade para o passado
    const cookie = serialize('guard_admin_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1,
        path: '/'
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true });
}
