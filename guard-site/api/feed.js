export default async function handler(req, res) {
    try {
        // Acessa o seu banco de dados 'loja-guard' diretamente pela API do Firebase
        const response = await fetch('https://firestore.googleapis.com/v1/projects/loja-guard/databases/(default)/documents/produtos');
        const data = await response.json();

        // Cabeçalho obrigatório do Google Shopping
        let xml = `<?xml version="1.0"?>\n`;
        xml += `<rss xmlns:g="http://base.google.com/ns/1.0" version="2.0">\n`;
        xml += `<channel>\n`;
        xml += `  <title>Guard Store</title>\n`;
        xml += `  <link>https://site-test-development.vercel.app</link>\n`;
        xml += `  <description>Catálogo de Produtos Guard - Equipamentos de Segurança</description>\n`;

        // Puxa cada produto e transforma no formato do Google
        if (data.documents) {
            data.documents.forEach(doc => {
                const id = doc.name.split('/').pop();
                const fields = doc.fields;

                // Captura os dados com proteção contra campos vazios
                const titulo = fields.titulo ? fields.titulo.stringValue : 'Produto Guard';
                const descricao = fields.descricao ? fields.descricao.stringValue : 'Sem descrição';
                const imagem = fields.imagem ? fields.imagem.stringValue : '';
                let preco = fields.preco ? fields.preco.stringValue : '0,00';

                // Converte preço "199,90" ou "1.250,00" para "199.90" (padrão exigido pelo Google)
                const precoLimpo = preco.replace(/\./g, '').replace(',', '.');
                const precoNumerico = parseFloat(precoLimpo).toFixed(2);

                xml += `  <item>\n`;
                xml += `    <g:id>${id}</g:id>\n`;
                xml += `    <g:title><![CDATA[${titulo}]]></g:title>\n`;
                xml += `    <g:description><![CDATA[${descricao}]]></g:description>\n`;
                xml += `    <g:link>https://site-test-development.vercel.app/produto?id=${id}</g:link>\n`;
                xml += `    <g:image_link><![CDATA[${imagem}]]></g:image_link>\n`;
                xml += `    <g:price>${precoNumerico} BRL</g:price>\n`;
                xml += `    <g:condition>new</g:condition>\n`;
                xml += `    <g:availability>in_stock</g:availability>\n`;
                xml += `  </item>\n`;
            });
        }

        xml += `</channel>\n</rss>`;

        // Avisa aos navegadores e ao Google que isso é um arquivo XML
        res.setHeader('Content-Type', 'text/xml; charset=utf-8');
        // Faz a Vercel segurar o cache por 1 hora para não sobrecarregar o Firebase
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        
        res.status(200).send(xml);

    } catch (error) {
        console.error(error);
        res.status(500).send('Erro ao gerar o Feed XML');
    }
}
