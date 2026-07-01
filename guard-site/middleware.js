export const config = {
    // 🚨 AQUI ESTÃO AS PÁGINAS PROTEGIDAS
    matcher: [
        '/admin',
        '/painel',
        '/gerenciamento-anuncios',
        '/gerenciador-caixas'
    ],
};

export default function middleware(request) {
    // Pega os cookies diretamente do cabeçalho
    const cookieHeader = request.headers.get('cookie') || '';
    
    // Verifica se o cookie invisível de Admin está presente
    const hasAdminToken = cookieHeader.includes('guard_admin_token=');

    if (!hasAdminToken) {
        // Se a pessoa NÃO TIVER o token, redireciona para a loja imediatamente
        const url = new URL('/store', request.url);
        return Response.redirect(url, 302);
    }

    // Se for um Admin, deixa a página carregar
}
