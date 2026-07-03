export default async function handler(req, res) {
    // Só aceita requisições do tipo POST (envio de dados)
    if (req.method !== 'POST') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    try {
        const { itens, idUsuario } = req.body; // Recebe apenas IDs e quantidades do cliente
        
        if (!itens || itens.length === 0) {
            return res.status(400).json({ erro: 'O carrinho está vazio.' });
        }

        let totalSeguro = 0;
        let itensConfirmados = [];

        // Loop para validar produto por produto direto no Firebase
        for (const item of itens) {
            // Vai no banco de dados buscar o produto pelo ID
            const response = await fetch(`https://firestore.googleapis.com/v1/projects/loja-guard/databases/(default)/documents/produtos/${item.id}`);
            
            if (!response.ok) {
                // Se o hacker inventar um ID que não existe, o sistema ignora
                continue; 
            }

            const data = await response.json();
            const fields = data.fields;

            // Extrai o preço real do banco de dados (ignora o que o cliente mandou)
            const precoRealString = fields.preco.stringValue;
            // Converte "199,90" para 199.90 matemático
            const precoRealNumerico = parseFloat(precoRealString.replace(/\./g, '').replace(',', '.'));
            
            // Faz a matemática segura: Preço Real x Quantidade solicitada
            const subtotal = precoRealNumerico * item.quantidade;
            totalSeguro += subtotal;

            itensConfirmados.push({
                id: item.id,
                titulo: fields.titulo.stringValue,
                quantidade: item.quantidade,
                precoUnitario: precoRealNumerico,
                subtotal: subtotal
            });
        }

        // ========================================================
        // AQUI ENTRARIA A INTEGRAÇÃO COM MERCADO PAGO, ASAAS, ETC.
        // Onde você enviaria a variável "totalSeguro" para gerar o PIX.
        // ========================================================

        // Retorna a resposta segura para a tela do cliente
        res.status(200).json({
            sucesso: true,
            mensagem: "Pedido processado com segurança!",
            totalAprovado: totalSeguro.toFixed(2),
            itens: itensConfirmados,
            // idPedidoGerado: ...
        });

    } catch (error) {
        console.error("Erro no checkout seguro:", error);
        res.status(500).json({ erro: 'Erro interno ao processar o pagamento.' });
    }
}
