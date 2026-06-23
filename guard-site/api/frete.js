export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
        const { from, to, products } = req.body;

        // O Melhor Envio exige array de 'products' para fazer o empacotamento automático
        const melhorEnvioPayload = {
            from: { postal_code: from.postal_code.replace(/\D/g, '') },
            to: { postal_code: to.postal_code.replace(/\D/g, '') },
            products: products.map(p => ({
                id: p.id,
                weight: Number(p.weight),
                width: Number(p.width),
                height: Number(p.height),
                length: Number(p.length),
                insurance_value: Number(p.insurance_value),
                quantity: parseInt(p.quantity)
            }))
        };

        const response = await fetch('https://melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MELHOR_ENVIO_TOKEN}`,
                'User-Agent': 'GuardStore (contato@guardalarmes.com)'
            },
            body: JSON.stringify(melhorEnvioPayload)
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            return res.status(response.status).json(errorResponse);
        }

        const dadosFrete = await response.json();
        return res.status(200).json(dadosFrete);

    } catch (error) {
        console.error('Erro na rota interna de frete:', error);
        return res.status(500).json({ error: 'Erro interno ao processar cotação' });
    }
}
