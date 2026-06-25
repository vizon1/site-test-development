// middleware.js na raiz do projeto
export const config = {
    // 🚨 AQUI VOCÊ DEFINE QUAIS PÁGINAS O SEGURANÇA DEVE PROTEGER
    matcher: [
        '/admin.html',
        '/painel.html',
        '/gerenciamento-anuncios.html',
        '/gerenciador-caixas.html'
    ],
};

export default function middleware(request) {
    // Tenta pegar o ingresso VIP (Cookie HttpOnly)
    const adminToken = request.cookies.get('guard_admin_token');

    // Se a pessoa NÃO TIVER o token VIP...
    if (!adminToken) {
        // Redireciona ela imediatamente de volta para a loja antes da página carregar
        return Response.redirect(new URL('/store.html', request.url));
        
        // (Opcional) Se você quiser que a página pareça que NÃO EXISTE, 
        // em vez de redirecionar para a loja, você pode usar:
        // return Response.redirect(new URL('/404.html', request.url));
    }

    // Se tiver o token, o segurança abre a porta e a página HTML carrega perfeitamente.
}
