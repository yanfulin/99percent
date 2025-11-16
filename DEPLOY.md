# Vercel 部署說明

## 部署步驟

### 方法一：使用 Vercel CLI（推薦）

1. 安裝 Vercel CLI：
```bash
npm i -g vercel
```

2. 登入 Vercel：
```bash
vercel login
```

3. 部署項目：
```bash
vercel
```

4. 生產環境部署：
```bash
vercel --prod
```

### 方法二：使用 GitHub 集成

1. 將代碼推送到 GitHub 倉庫

2. 訪問 [Vercel](https://vercel.com)

3. 點擊 "New Project"

4. 導入你的 GitHub 倉庫

5. Vercel 會自動檢測配置並部署

## 項目結構

```
.
├── api/
│   └── yahoo-finance/
│       └── [ticker].js    # Serverless 函數（動態路由）
├── index.html              # 主頁面
├── app.js                  # 前端邏輯
├── styles.css              # 樣式文件
├── vercel.json             # Vercel 配置
└── package.json            # 項目配置
```

## API 端點

部署後，API 端點將是：
- `https://your-project.vercel.app/api/yahoo-finance/[ticker]`

例如：
- `https://your-project.vercel.app/api/yahoo-finance/%5EGSPC`
- `https://your-project.vercel.app/api/yahoo-finance/VSS`
- `https://your-project.vercel.app/api/yahoo-finance/TLT`

## 注意事項

- Vercel 會自動處理 serverless 函數的部署
- 靜態文件（HTML, CSS, JS）會自動部署
- 不需要 `server.js`，因為使用 Vercel 的 serverless 函數
- 確保 `.vercelignore` 中排除了 `server.js` 和 `node_modules`

