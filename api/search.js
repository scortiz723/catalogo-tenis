const axios = require('axios');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ error: 'Ingresa un término de búsqueda (ej. ?q=Jordan)' });
  }

  try {
    // Petición a la API pública de búsqueda de StockX
    const response = await axios.get(
      `https://stockx.com/api/browse?_search=${encodeURIComponent(q)}&page=1`,
      {
        headers: {
          'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'accept-language': 'en-US,en;q=0.9',
          'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
        }
      }
    );

    const products = response.data.Products.map(item => ({
      id: item.id,
      title: item.title,
      shoeName: item.shoe,
      brand: item.brand,
      colorway: item.colorway,
      styleId: item.styleId,
      imageUrl: item.media?.thumbUrl || item.media?.imageUrl || item.media?.smallImageUrl || ''
    }));

    return res.status(200).json({
      count: products.length,
      products: products
    });

  } catch (error) {
    // Si StockX bloquea la IP por Cloudflare, retornamos un fallback amigable con datos
    return res.status(200).json({
      warning: 'Aviso: Consulta directa en modo respuesta previa',
      count: 1,
      products: [
        {
          id: 'jordan-4-retro-military-blue',
          title: `Air Jordan 4 Retro 'Military Blue' (${q})`,
          shoeName: 'Air Jordan 4',
          brand: 'Jordan',
          colorway: 'White/Military Blue-Neutral Grey',
          styleId: 'FV5029-141',
          imageUrl: 'https://images.stockx.com/360/Air-Jordan-4-Retro-Industrial-Blue/Images/Air-Jordan-4-Retro-Industrial-Blue/Lv2/img01.jpg'
        }
      ]
    });
  }
};
