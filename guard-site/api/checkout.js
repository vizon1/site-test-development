export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ erro: 'Método não permitido' });
    }

    // 🔴 COLE SEU ACCESS TOKEN DE PRODUÇÃO AQUI
    const MERCADO_PAGO_TOKEN = 'APP_USR-COLE-SEU-TOKEN-AQUI';

    try {
        // Recebe os dados do frontend, incluindo os de cartão de crédito/débito
        const { 
            userId, clienteEmail, clienteNome, clienteCpf, 
            itens, frete, metodoPagamento,
            tokenCartao, parcelas, idMetodoCartao 
        } = req.body;
        
        if (!itens || itens.length === 0) {
            return res.status(400).json({ erro: 'O carrinho está vazio.' });
        }

        let subtotalSeguro = 0;

        // 1. MATEMÁTICA SEGURA (Lendo direto do Firebase)
        for (const item of itens) {
            const response = await fetch(`https://firestore.googleapis.com/v1/projects/loja-guard/databases/(default)/documents/produtos/${item.id}`);
            if (!response.ok) continue;

            const data = await response.json();
            const precoNumerico = parseFloat(data.fields.preco.stringValue.replace(/\./g, '').replace(',', '.'));
            subtotalSeguro += (precoNumerico * item.quantidade);
        }

        const totalFinalSeguro = subtotalSeguro + (frete || 0);
        const idempotencyKey = crypto.randomUUID();

        // 2. PREPARAR A COBRANÇA PARA O MERCADO PAGO
        let mpPayload = {
            transaction_amount: Number(totalFinalSeguro.toFixed(2)),
            description: `Compra na Guard Store`,
            payer: {
                email: clienteEmail,
                first_name: clienteNome.split(' ')[0],
                last_name: clienteNome.split(' ').slice(1).join(' '),
                identification: {
                    type: clienteCpf.length > 11 ? 'CNPJ' : 'CPF',
                    number: clienteCpf.replace(/\D/g, '')
                }
            }
        };

        // Roteamento inteligente do método de pagamento
        if (metodoPagamento === 'pix') {
            mpPayload.payment_method_id = 'pix';
        } else if (metodoPagamento === 'boleto') {
            mpPayload.payment_method_id = 'bolbradesco'; 
        } else if (metodoPagamento === 'cartao_credito' || metodoPagamento === 'cartao_debito') {
            mpPayload.token = tokenCartao; // Token blindado gerado pelo frontend
            mpPayload.installments = Number(parcelas) || 1;
            mpPayload.payment_method_id = idMetodoCartao; // Ex: 'visa', 'master'
        }

        // 3. EXECUTAR A TRANSAÇÃO
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MERCADO_PAGO_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify(mpPayload)
        });

        const mpData = await mpResponse.json();

        if (mpData.status === 400 || mpData.error) {
            console.error("Erro MP:", mpData);
            return res.status(400).json({ erro: 'Pagamento recusado pela operadora. Verifique os dados.' });
        }

        // 4. ORGANIZAR A RESPOSTA DEPENDENDO DO MÉTODO
        let respostaPagamento = { status: mpData.status, idTransacaoMP: mpData.id };

        if (metodoPagamento === 'pix') {
            respostaPagamento.copiaECola = mpData.point_of_interaction.transaction_data.qr_code;
            respostaPagamento.qrCodeBase64 = mpData.point_of_interaction.transaction_data.qr_code_base64;
        } else if (metodoPagamento === 'boleto') {
            respostaPagamento.linkBoleto = mpData.transaction_details.external_resource_url;
        }

        // 5. SALVAR PEDIDO OFICIAL NO FIREBASE
        const idPedidoGerado = "PED-" + Date.now();
        const statusPedido = (mpData.status === 'approved') ? 'Pago' : 'Aguardando Pagamento';

        const novoPedidoOficial = {
            fields: {
                idPedido: { stringValue: idPedidoGerado },
                userId: { stringValue: userId },
                clienteEmail: { stringValue: clienteEmail },
                clienteNome: { stringValue: clienteNome },
                subtotal: { doubleValue: subtotalSeguro },
                frete: { doubleValue: frete || 0 },
                total: { doubleValue: totalFinalSeguro },
                status: { stringValue: statusPedido },
                metodoPagamento: { stringValue: metodoPagamento },
                dataCriacao: { stringValue: new Date().toISOString() },
                pixCopiaECola: { stringValue: respostaPagamento.copiaECola || '' },
                linkBoleto: { stringValue: respostaPagamento.linkBoleto || '' }
            }
        };

        await fetch(`https://firestore.googleapis.com/v1/projects/loja-guard/databases/(default)/documents/pedidos?documentId=${idPedidoGerado}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(novoPedidoOficial)
        });

        // 6. SUCESSO DEVOLVIDO AO FRONTEND
        res.status(200).json({
            sucesso: true,
            idPedido: idPedidoGerado,
            totalAprovado: totalFinalSeguro.toFixed(2),
            pagamento: respostaPagamento
        });

    } catch (error) {
        console.error("Erro Crítico:", error);
        res.status(500).json({ erro: 'Erro interno ao processar o pagamento.' });
    }
}
