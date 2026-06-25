import { serialize } from 'cookie';

export default function handler(req, res) {
    const cookie = serialize('guard_admin_token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: -1, // Data de validade no passado destroi o cookie
        path: '/'
    });

    res.setHeader('Set-Cookie', cookie);
    return res.status(200).json({ success: true });
}
