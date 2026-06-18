export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Método não permitido.' });
    }

    const tokenMelhorEnvio = process.env.MELHOR_ENVIO_TOKEN;

    if (!tokenMelhorEnvio) {
        return res.status(500).json({ error: 'Token não configurado na Vercel.' });
    }

    try {
        const response = await fetch('https://sandbox.melhorenvio.com.br/api/v2/me/shipment/calculate', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${tokenMelhorEnvio}`,
                'User-Agent': 'Guard Store (suporte@guard.com.br)'
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: 'Erro ao consultar o Melhor Envio.' });
        }

        const cotacoes = await response.json();
        return res.status(200).json(cotacoes);

    } catch (error) {
        return res.status(500).json({ error: 'Erro interno no servidor de frete.' });
    }
}
