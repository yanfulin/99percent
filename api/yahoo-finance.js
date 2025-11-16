const https = require('https');

module.exports = async (req, res) => {
    // 設置 CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 處理 OPTIONS 請求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // 從 URL 路徑中獲取 ticker
    // Vercel 會將 :ticker 作為查詢參數傳遞
    const ticker = req.query.ticker;
    
    if (!ticker) {
        return res.status(400).json({ error: 'Ticker parameter is required' });
    }
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo`;
    
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        }
    };
    
    return new Promise((resolve) => {
        https.get(url, options, (yahooRes) => {
            let data = '';
            
            // 檢查狀態碼
            if (yahooRes.statusCode !== 200) {
                console.error(`Yahoo Finance API returned status ${yahooRes.statusCode}`);
                const response = res.status(yahooRes.statusCode).json({ 
                    error: `Yahoo Finance API error: ${yahooRes.statusCode}` 
                });
                return resolve(response);
            }
            
            yahooRes.on('data', (chunk) => {
                data += chunk;
            });
            
            yahooRes.on('end', () => {
                try {
                    if (!data || data.trim().length === 0) {
                        throw new Error('Empty response from Yahoo Finance');
                    }
                    
                    const jsonData = JSON.parse(data);
                    
                    // 檢查是否有錯誤
                    if (jsonData.chart && jsonData.chart.error) {
                        console.error('Yahoo Finance API error:', jsonData.chart.error);
                        const response = res.status(400).json({ 
                            error: jsonData.chart.error.description || 'Yahoo Finance API error' 
                        });
                        return resolve(response);
                    }
                    
                    const response = res.json(jsonData);
                    return resolve(response);
                } catch (error) {
                    console.error('Parse error:', error.message);
                    console.error('Response data:', data.substring(0, 200));
                    const response = res.status(500).json({ 
                        error: 'Failed to parse response',
                        details: error.message 
                    });
                    return resolve(response);
                }
            });
        }).on('error', (error) => {
            console.error('Proxy error:', error);
            const response = res.status(500).json({ 
                error: 'Failed to fetch data from Yahoo Finance',
                details: error.message 
            });
            return resolve(response);
        });
    });
};

