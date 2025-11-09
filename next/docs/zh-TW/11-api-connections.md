# API 連接

## 概覽

API 連接使您的工作區能夠透過 OAuth 認證和 HTTP 請求與外部服務互動。每個工作區可以連接到多個服務，每種服務類型一個連接。

## 什麼是 API 連接？

**API 連接**是：
- 透過 OAuth 認證存取外部服務
- 在工作區層級管理
- 由動作用於進行 API 呼叫
- 自動刷新令牌
- 每個工作區每種服務類型限制為一個

## 支援的服務

### 社交媒體
- **Facebook** - 發布、讀取頁面、管理廣告
- **Instagram** - 發布媒體、讀取洞察、管理評論
- **Twitter/X** - 推文、讀取時間軸、管理帳戶
- **LinkedIn** - 發布文章、公司頁面、讀取分析
- **TikTok** - 上傳視訊、讀取分析
- **Pinterest** - 建立圖釘、管理圖板

### 生產力
- **Google Workspace** - Gmail、Sheets、Docs、Drive、Calendar
- **Microsoft 365** - Outlook、Excel、Word、OneDrive
- **Slack** - 傳送訊息、讀取頻道、管理工作區
- **Notion** - 建立頁面、更新資料庫
- **Airtable** - 讀取/寫入記錄、管理基地

### 電商
- **Shopify** - 產品管理、訂單、庫存
- **WooCommerce** - 產品、客戶、訂單
- **Stripe** - 付款、客戶、訂閱
- **Square** - 付款、庫存、客戶

### 自訂 API
- **REST API** - 自訂 HTTP 端點
- **GraphQL** - 自訂 GraphQL 端點
- **Webhooks** - 接收外部事件

## 建立連接

### OAuth 連接流程

#### 步驟 1：選擇服務
```
導航到：工作區 → 連接 → 新增連接
選擇：Instagram
```

#### 步驟 2：授權
```
1. 點擊「連接 Instagram」
2. 重新導向到 Instagram 登入
3. 使用 Instagram 帳戶登入
4. 審查請求的權限
5. 點擊「授權」
6. 重新導向回平台
```

#### 步驟 3：配置
```
連接設定：
  服務：Instagram
  帳戶：@mybusiness
  狀態：已連接
  權限：發布媒體、讀取洞察
  令牌到期：啟用自動刷新
```

## 連接限制

### 每種服務類型一個

**重要規則**：每個工作區每種服務類型只能有一個連接。

**有效的工作區配置**：
```
✓ Instagram（1 個帳戶）
✓ Facebook（1 個帳戶）
✓ Twitter（1 個帳戶）
✓ Google Sheets（1 個帳戶）
✓ Mailchimp（1 個帳戶）

總計：5 個不同的服務
```

**無效的工作區配置**：
```
✗ Instagram 帳戶 A
✗ Instagram 帳戶 B

錯誤：每個工作區只允許一個 Instagram 連接
```

### 多個帳戶的解決方法

如果您需要同一服務的多個帳戶：

**選項 1：多個工作區**
```
代理：社交媒體管理員

工作區 A：客戶 A Instagram
  連接：Instagram（@client_a）

工作區 B：客戶 B Instagram
  連接：Instagram（@client_b）
```

## 在動作中使用連接

### 選擇連接

```
動作步驟：發布到 Instagram

配置：
  類型：API 執行
  連接：（從工作區選擇）
    → Instagram (@mybusiness)
  
  方法：POST
  端點：/media
```

## 服務特定指南

### Instagram

**所需權限**：
- `instagram_basic`
- `instagram_content_publish`
- `instagram_manage_insights`

**常見端點**：
```
POST /media
  建立媒體物件（尚未發布）
  主體：{ image_url, caption }

POST /media_publish
  發布建立的媒體物件
  主體：{ creation_id }
```

### Facebook

**所需權限**：
- `pages_manage_posts`
- `pages_read_engagement`

**常見端點**：
```
POST /{page-id}/feed
  發布貼文
  主體：{ message, link }
```

## 連接管理

### 檢視連接狀態

```
連接儀表板：
  服務：Instagram
  帳戶：@mybusiness
  狀態：● 已連接
  最後使用：2025-10-20 10:30 AM
  API 呼叫（24 小時）：145 / 5000
  成功率：98.5%
```

### 刷新令牌

```
OAuth 令牌生命週期：

初始授權：
  存取令牌：有效期 60 天
  刷新令牌：有效期 90 天

自動刷新：
  平台監控到期
  在到期前 7 天刷新
  更新儲存的憑證
```

## 速率限制

### 理解速率限制

```
服務：Instagram
速率限制：每個使用者每小時 200 次呼叫

平台處理：
  - 自動追蹤呼叫
  - 接近限制時暫停
  - 排隊請求
  - 視窗重置時恢復
```

## 錯誤處理

### 常見 API 錯誤

#### 400 錯誤請求
```
原因：請求資料無效

解決方案：
  - 檢查請求主體格式
  - 驗證必填欄位
  - 檢查 API 文件
```

#### 401 未授權
```
原因：令牌無效或已過期

解決方案：
  - 刷新 OAuth 令牌
  - 重新授權連接
  - 檢查權限
```

#### 429 速率限制
```
原因：請求太多

解決方案：
  - 等待速率限制重置
  - 實施節流
  - 減少請求頻率
```

## 安全最佳實踐

### 令牌儲存

```
安全措施：
  - 靜態加密
  - 傳輸加密（HTTPS）
  - 不在 UI 中暴露
  - 自動輪換
```

## 下一步

- [動作](./09-actions.md) - 在工作流程中使用連接
- [動作步驟](./10-action-steps.md) - 配置 API 執行步驟
- [排程](./12-scheduling.md) - 自動化 API 互動
