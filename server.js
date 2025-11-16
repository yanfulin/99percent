const express = require('express');
const path = require('path');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 8080;

// 允許 CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// 提供靜態文件
app.use(express.static(path.join(__dirname)));

// 代理 Yahoo Finance API
app.get('/api/yahoo-finance/:ticker', (req, res) => {
    const ticker = req.params.ticker;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${ticker}?interval=1d&range=6mo`;
    
    const options = {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json'
        }
    };
    
    https.get(url, options, (yahooRes) => {
        let data = '';
        
        // 檢查狀態碼
        if (yahooRes.statusCode !== 200) {
            console.error(`Yahoo Finance API returned status ${yahooRes.statusCode}`);
            return res.status(yahooRes.statusCode).json({ 
                error: `Yahoo Finance API error: ${yahooRes.statusCode}` 
            });
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
                    return res.status(400).json({ 
                        error: jsonData.chart.error.description || 'Yahoo Finance API error' 
                    });
                }
                
                res.json(jsonData);
            } catch (error) {
                console.error('Parse error:', error.message);
                console.error('Response data:', data.substring(0, 200));
                res.status(500).json({ 
                    error: 'Failed to parse response',
                    details: error.message 
                });
            }
        });
    }).on('error', (error) => {
        console.error('Proxy error:', error);
        res.status(500).json({ 
            error: 'Failed to fetch data from Yahoo Finance',
            details: error.message 
        });
    });
});

// 主頁路由
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`服務器運行在 http://localhost:${PORT}`);
    console.log(`請在瀏覽器打開 http://localhost:${PORT}`);
});

