import { NextResponse } from 'next/server';

export const config = {
    matcher: [
        '/admin.html',
        '/painel.html',
        '/gerenciamento-anuncios.html',
        '/gerenciador-caixas.html'
    ],
};

export function middleware(request) {
    const adminToken = request.cookies.get('guard_admin_token');

    if (!adminToken) {
        // Se a pessoa não tiver o Cookie, redireciona ela para a loja
        request.nextUrl.pathname = '/store.html';
        return NextResponse.redirect(request.nextUrl);
    }

    return NextResponse.next();
}
