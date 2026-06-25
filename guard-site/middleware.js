import { NextResponse } from 'next/server';

export const config = {
    // Estas são as rotas que a Vercel vai proteger na borda
    matcher: [
        '/admin.html',
        '/admin',
        '/painel.html',
        '/gerenciamento-anuncios.html',
        '/gerenciador-caixas.html'
    ],
};

export function middleware(request) {
    // Pega o token de administrador dos cookies
    const adminToken = request.cookies.get('guard_admin_token');

    // Se o token NÃO existir ou for inválido, bloqueia acesso e simula página inexistente (404)
    if (!adminToken) {
        // Redireciona silenciosamente para uma página de erro 404 personalizada 
        // ou para a home se você preferir. 
        request.nextUrl.pathname = '/404.html';
        return NextResponse.rewrite(request.nextUrl);
    }

    // Se tiver o cookie, permite baixar a página html
    return NextResponse.next();
}
