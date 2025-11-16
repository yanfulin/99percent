# 投資組合回報分析網站

這是一個顯示 S&P 500、國際小型股與美國長債近 1、3、6 月平均回報的網站。

## 功能特色

- 📈 顯示 S&P 500 指數回報
- 🌍 顯示國際小型股（VSS ETF）回報
- 📊 顯示美國長債（TLT ETF）回報
- 📅 計算近 1 月、3 月、6 月的平均回報率
- 🎨 現代化的響應式設計
- 🔄 支援手動重新載入數據

## 使用方法

### 安裝和啟動

1. 安裝依賴：
```bash
npm install
```

2. 啟動服務器：
```bash
npm start
```

服務器會自動啟動在 `http://localhost:8080`，並在終端顯示訪問地址。

### 功能說明

- 服務器包含後端代理，解決 CORS 跨域問題
- 自動從 Yahoo Finance 獲取最新數據
- 支援手動重新載入數據

## 技術說明

- **數據來源**：Yahoo Finance API
- **S&P 500**：使用 `^GSPC` 指數
- **國際小型股**：使用 `VSS` ETF（Vanguard FTSE All-World ex-US Small-Cap）
- **美國長債**：使用 `TLT` ETF（iShares 20+ Year Treasury Bond）

## 部署到 Vercel

### 使用 Vercel CLI

1. 安裝 Vercel CLI：
```bash
npm i -g vercel
```

2. 登入並部署：
```bash
vercel login
vercel --prod
```

### 使用 GitHub 集成

1. 將代碼推送到 GitHub
2. 在 [Vercel](https://vercel.com) 導入項目
3. Vercel 會自動檢測配置並部署

詳細部署說明請參考 [DEPLOY.md](./DEPLOY.md)

## 注意事項

- 數據依賴 Yahoo Finance API，可能需要網路連線
- 本地開發使用 Express 服務器，Vercel 部署使用 serverless 函數
- 回報率計算基於收盤價的比較

