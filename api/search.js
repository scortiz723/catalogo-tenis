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
    const response = await axios.post(
      'https://e388-dsn.algolia.net/1/indexes/products/query?x-algolia-agent=Algolia%20for%20JavaScript%20(4.13.0)%3B%20Browser&x-algolia-api-key=6bfb5050d0320c15e92f14d20fe55b92&x-algolia-application-id=E388',
      {
        params: `query=${encodeURIComponent(q)}&hitsPerPage=12`
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      }
    );

    const products = response.data.hits.map(item => ({
      id: item.objectID,
      title: item.title,
      shoeName: item.shoe,
      brand: item.brand,
      colorway: item.colorway,
      styleId: item.styleId,
      imageUrl: item.media?.imageUrl || item.media?.smallImageUrl || item.media?.thumbUrl || ''
    }));

    return res.status(200).json({
      count: products.length,
      products: products
    });

  } catch (error) {
    return res.status(500).json({ 
      error: 'Error al consultar StockX', 
      mensaje: error.message 
    });
  }
};
