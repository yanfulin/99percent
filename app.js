// 金融工具配置
const ASSETS = {
    sp500: {
        name: 'S&P 500',
        ticker: '^GSPC',
        icon: '📈'
    },
    intlSmallCap: {
        name: '國際小型股',
        ticker: 'VSS', // Vanguard FTSE All-World ex-US Small-Cap ETF
        icon: '🌍'
    },
    usLongBond: {
        name: '美國長債',
        ticker: 'TLT', // iShares 20+ Year Treasury Bond ETF
        icon: '📊'
    }
};

// 使用本地代理 API 獲取數據（避免 CORS 問題）
async function fetchYahooFinanceData(ticker) {
    // URL 編碼 ticker（特別是 ^ 符號需要編碼為 %5E）
    const encodedTicker = encodeURIComponent(ticker);
    const url = `/api/yahoo-finance/${encodedTicker}`;
    
    try {
        const response = await fetch(url);
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // 檢查 API 返回的錯誤
        if (data.error) {
            throw new Error(data.error);
        }
        
        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            throw new Error('No data returned from API');
        }
        
        const result = data.chart.result[0];
        
        if (!result.timestamp || !result.indicators || !result.indicators.quote) {
            throw new Error('Invalid data structure from API');
        }
        
        const timestamps = result.timestamp;
        const closes = result.indicators.quote[0].close;
        
        if (!timestamps || !closes) {
            throw new Error('Missing timestamp or close price data');
        }
        
        // 過濾掉 null 值並創建數據點
        const validData = [];
        for (let i = 0; i < timestamps.length; i++) {
            if (closes[i] !== null && timestamps[i] !== null) {
                validData.push({
                    date: new Date(timestamps[i] * 1000),
                    close: closes[i]
                });
            }
        }
        
        if (validData.length === 0) {
            throw new Error('No valid price data found');
        }
        
        // 按日期排序（確保時間順序）
        validData.sort((a, b) => a.date - b.date);
        
        console.log(`獲取到 ${validData.length} 個有效數據點`);
        console.log(`日期範圍: ${validData[0].date.toISOString()} 到 ${validData[validData.length - 1].date.toISOString()}`);
        
        return validData;
    } catch (error) {
        console.error(`Error fetching data for ${ticker}:`, error);
        throw error;
    }
}

// 計算平均回報
function calculateReturns(priceData) {
    if (!priceData || priceData.length === 0) {
        return {
            '1month': null,
            '3month': null,
            '6month': null
        };
    }
    
    // 使用數據中的最後一個日期作為當前日期
    const latestDate = priceData[priceData.length - 1].date;
    const currentPrice = priceData[priceData.length - 1].close;
    
    // 計算各期間的起始日期（從最新日期往前推）
    const oneMonthAgo = new Date(latestDate);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    
    const threeMonthsAgo = new Date(latestDate);
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const sixMonthsAgo = new Date(latestDate);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    // 找到最接近的歷史價格（必須在目標日期之前或當天）
    function findClosestPrice(targetDate) {
        let closest = null;
        let minDiff = Infinity;
        
        for (const dataPoint of priceData) {
            // 只考慮目標日期之前或當天的數據點
            if (dataPoint.date <= targetDate) {
                const diff = targetDate - dataPoint.date;
                if (diff < minDiff) {
                    minDiff = diff;
                    closest = dataPoint;
                }
            }
        }
        
        return closest ? closest.close : null;
    }
    
    const price1Month = findClosestPrice(oneMonthAgo);
    const price3Month = findClosestPrice(threeMonthsAgo);
    const price6Month = findClosestPrice(sixMonthsAgo);
    
    // 計算回報率 (百分比)
    const calculateReturn = (oldPrice, newPrice) => {
        if (!oldPrice || !newPrice || oldPrice === 0) return null;
        return ((newPrice - oldPrice) / oldPrice) * 100;
    };
    
    const return1Month = price1Month ? calculateReturn(price1Month, currentPrice) : null;
    const return3Month = price3Month ? calculateReturn(price3Month, currentPrice) : null;
    const return6Month = price6Month ? calculateReturn(price6Month, currentPrice) : null;
    
    // 調試信息
    console.log('計算回報:', {
        latestDate: latestDate.toISOString(),
        currentPrice,
        price1Month,
        price3Month,
        price6Month,
        return1Month,
        return3Month,
        return6Month
    });
    
    return {
        '1month': return1Month,
        '3month': return3Month,
        '6month': return6Month
    };
}

// 格式化回報率顯示
function formatReturn(value) {
    if (value === null || value === undefined) {
        return 'N/A';
    }
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
}

// 獲取回報類別（用於樣式）
function getReturnClass(value) {
    if (value === null || value === undefined) return 'neutral';
    return value > 0 ? 'positive' : value < 0 ? 'negative' : 'neutral';
}

// 創建資產卡片
function createAssetCard(assetKey, asset, returns) {
    const card = document.createElement('div');
    card.className = 'card';
    
    const periods = [
        { key: '1month', label: '近1月' },
        { key: '3month', label: '近3月' },
        { key: '6month', label: '近6月' }
    ];
    
    const returnsHTML = periods.map(period => {
        const value = returns[period.key];
        return `
            <div class="return-item">
                <span class="return-period">${period.label}</span>
                <span class="return-value ${getReturnClass(value)}">
                    ${formatReturn(value)}
                </span>
            </div>
        `;
    }).join('');
    
    card.innerHTML = `
        <div class="card-header">
            <span class="card-title">${asset.name}</span>
            <span class="card-icon">${asset.icon}</span>
        </div>
        <div class="returns-grid">
            ${returnsHTML}
        </div>
    `;
    
    return card;
}

// 載入並顯示數據
async function loadData() {
    const loadingEl = document.getElementById('loading');
    const errorEl = document.getElementById('errorMessage');
    const cardsContainer = document.getElementById('cardsContainer');
    
    // 顯示載入狀態
    loadingEl.style.display = 'flex';
    errorEl.style.display = 'none';
    cardsContainer.innerHTML = '';
    
    try {
        // 並行獲取所有資產數據
        const assetPromises = Object.entries(ASSETS).map(async ([key, asset]) => {
            try {
                const priceData = await fetchYahooFinanceData(asset.ticker);
                const returns = calculateReturns(priceData);
                return { key, asset, returns };
            } catch (error) {
                console.error(`Error processing ${asset.name}:`, error);
                return {
                    key,
                    asset,
                    returns: { '1month': null, '3month': null, '6month': null }
                };
            }
        });
        
        const results = await Promise.all(assetPromises);
        
        // 創建並顯示卡片
        results.forEach(({ key, asset, returns }) => {
            const card = createAssetCard(key, asset, returns);
            cardsContainer.appendChild(card);
        });
        
        // 更新最後更新時間
        const lastUpdated = document.createElement('div');
        lastUpdated.className = 'last-updated';
        lastUpdated.textContent = `最後更新: ${new Date().toLocaleString('zh-TW')}`;
        cardsContainer.appendChild(lastUpdated);
        
    } catch (error) {
        console.error('Error loading data:', error);
        errorEl.textContent = `載入數據時發生錯誤: ${error.message}`;
        errorEl.style.display = 'block';
    } finally {
        loadingEl.style.display = 'none';
    }
}

// 測試 API 連接
async function testAPI() {
    try {
        const response = await fetch('/api/yahoo-finance/%5EGSPC');
        const data = await response.json();
        console.log('API Test Response:', data);
        return true;
    } catch (error) {
        console.error('API Test Failed:', error);
        return false;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    console.log('頁面載入完成，開始獲取數據...');
    loadData();
    
    // 綁定重新載入按鈕
    document.getElementById('refreshBtn').addEventListener('click', () => {
        console.log('手動重新載入數據...');
        loadData();
    });
});

