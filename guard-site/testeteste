export const config = {
    matcher: [
        '/admin',
        '/painel',
        '/gerenciamento-anuncios',
        '/gerenciador-caixas',
        '/gerenciamento-nfe',
        '/gerenciamento-envios'
    ],
};

export default function middleware(request) {
    const cookieHeader = request.headers.get('cookie') || '';
    
    const hasAdminToken = cookieHeader.includes('guard_admin_token=');

    if (!hasAdminToken) {
        const url = new URL('/store', request.url);
        return Response.redirect(url, 302);
    }
}
