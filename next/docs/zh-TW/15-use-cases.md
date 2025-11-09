# 使用案例與範例

## 概覽

本指南提供常見自動化場景的真實世界範例。每個使用案例都包含完整的設定說明、資料模型、動作和排程。

## 內容創作與行銷

### 使用案例 1：部落格到社交媒體管道

**目標**：自動將部落格文章轉換為多個平台的社交媒體貼文。

#### 設定

**代理**：內容行銷中心

**工作區**：部落格分發

**模型**：

```
模型 1：部落格文章
欄位：
  - id（自動）
  - title（文字，必填）
  - content（長文字，必填）
  - author（文字）
  - category（選擇：技術、行銷、產品）
  - publishedDate（日期）
  - featuredImage（檔案）
  - status（選擇：草稿、已發布）
  - socialPostsCreated（核取方塊）

模型 2：社交貼文
欄位：
  - id（自動）
  - sourceArticle（關聯 → 部落格文章）
  - platform（選擇：Instagram、Twitter、LinkedIn、Facebook）
  - caption（長文字）
  - imageUrl（URL）
  - status（選擇：草稿、準備好、已發布）
  - scheduledTime（日期時間）
  - postedAt（日期時間）
  - externalId（文字）
  - likes（數字）
```

**表單**：新部落格文章

```
欄位：
  - 標題
  - 內容
  - 作者
  - 類別
  - 精選圖像
```

**動作 1**：生成社交貼文

```
位置：部落格文章模型
觸發器：手動或發布時

步驟 1：AI 推理 - 提取重點
  輸入：文章.content
  提示：「從以下內容提取 3 個重點：{content}」
  輸出：Temp.keyPoints

步驟 2：建立 Instagram 貼文
  類型：建立記錄
  模型：社交貼文
  欄位：
    sourceArticle：當前記錄
    platform：「Instagram」
    status：「草稿」

步驟 3：AI 推理 - Instagram 說明
  輸入：文章.title，Temp.keyPoints
  提示：「建立 Instagram 說明（最多 200 字）：
           標題：{title}
           重點：{keyPoints}
           包含相關主題標籤和表情符號」
  輸出：社交貼文（來自步驟 2）.caption

步驟 4：AI 圖像生成 - Instagram 視覺
  輸入：文章.title
  提示：「建立 Instagram 正方形圖像（1:1）：
           主題：{title}
           風格：現代、多彩、引人入勝
           包含標題的文字疊加」
  輸出：社交貼文（來自步驟 2）.imageUrl

步驟 5-8：對 Twitter、LinkedIn、Facebook 重複
  （使用特定於平台的提示的相同模式）

步驟 9：更新文章
  更新：文章.socialPostsCreated = true
```

**動作 2**：發布到平台

```
位置：社交貼文模型
觸發器：排程

步驟 1：條件 - 路由到平台
  如果 platform = "Instagram"：
    → 執行 Instagram API 呼叫
  如果 platform = "Twitter"：
    → 執行 Twitter API 呼叫
  （等等）

步驟 2：API 執行
  連接：{platform} 連接
  方法：POST
  端點：/create_post
  主體：
    caption：{caption}
    image_url：{imageUrl}
  
  輸出：
    response.id → externalId
    response.url → externalUrl

步驟 3：更新狀態
  更新：
    status：「已發布」
    postedAt：{現在}
```

**排程**：每日社交發布

```
模型：社交貼文
篩選器：status = "準備好" AND scheduledTime <= 現在
動作：發布到平台
頻率：每小時
限制：每次執行 10 個貼文
```

#### 工作流程

1. 作者撰寫部落格文章
2. 透過表單提交
3. 手動執行「生成社交貼文」動作
4. 審查生成的貼文（如果需要則編輯）
5. 設定 status = "準備好" 和 scheduledTime
6. 排程在指定時間自動發布
7. 獨立排程每天獲取分析

#### 結果

- 一篇部落格文章 → 4 個社交貼文
- 自動化每日發布
- 分析追蹤
- 社交媒體管理節省 90% 時間

---

## 電商自動化

### 使用案例 3：產品目錄管理

**目標**：與 Shopify 同步產品，使用 AI 生成描述，管理庫存。

#### 設定

**模型**：

```
模型：產品
欄位：
  - sku（文字，唯一）
  - name（文字）
  - rawSpecs（文字）
  - generatedDescription（長文字）
  - price（貨幣）
  - inventory（數字）
  - shopifyId（文字）
  - lastSynced（日期時間）
  - needsSync（核取方塊）
```

**動作**：生成產品描述

```
步驟 1：AI 推理
  輸入：rawSpecs
  提示：「建立引人注目的產品描述：
           規格：{rawSpecs}
           格式：2 段，100-150 字
           語氣：有說服力，突出優勢
           包含 SEO 關鍵字」
  輸出：generatedDescription

步驟 2：AI 推理 - 提取關鍵字
  輸入：generatedDescription
  輸出：seoKeywords
```

**動作**：同步到 Shopify

```
步驟 1：檢查產品是否存在
  API：GET /products
  按 SKU 搜尋

步驟 2：建立或更新
  如果存在：
    API：PUT /products/{id}
  如果不存在：
    API：POST /products
  
  主體：
    title：{name}
    description：{generatedDescription}
    price：{price}
    inventory：{inventory}

步驟 3：更新同步狀態
  lastSynced：現在
  needsSync：false
  shopifyId：response.id
```

**排程**：每小時同步

```
篩選器：needsSync = true
動作：同步到 Shopify
頻率：每小時
```

---

## 客戶參與

### 使用案例 5：潛在客戶培育活動

**目標**：使用 AI 個人化為新潛在客戶自動化跟進序列。

#### 設定

**模型**：

```
模型 1：潛在客戶
欄位：
  - name（文字）
  - email（電子郵件）
  - company（文字）
  - interests（多選）
  - stage（選擇：新、已聯絡、參與中、合格）
  - lastContactDate（日期）

模型 2：通訊
欄位：
  - lead（關聯 → 潛在客戶）
  - type（選擇：電子郵件、電話、會議）
  - content（長文字）
  - sentAt（日期時間）
  - response（長文字）
```

**動作**：生成個人化電子郵件

```
步驟 1：AI 推理
  輸入：潛在客戶.name、潛在客戶.company、潛在客戶.interests
  提示：「撰寫個人化外聯電子郵件：
           收件人：{company} 的 {name}
           興趣：{interests}
           語氣：專業但友好
           長度：3 個簡短段落
           包含相關價值主張
           以具體的行動號召結束」
  輸出：emailContent

步驟 2：傳送電子郵件
  API：SendGrid
  收件人：{email}
  主旨：AI 生成
  內文：{emailContent}

步驟 3：建立通訊記錄
  建立記錄：通訊
  欄位：lead、type、content、sentAt

步驟 4：更新潛在客戶
  lastContactDate：今天
  stage：「已聯絡」
```

**排程**：每日潛在客戶外聯

```
篩選器：stage = "新" AND createdDate <= 今天 - 1 天
動作：生成個人化電子郵件
頻率：每天上午 9:00
限制：每天 20 個潛在客戶
```

---

## 營運與生產力

### 使用案例 7：會議記錄到行動項目

**目標**：將會議記錄轉換為組織化的任務和摘要。

#### 設定

**模型**：

```
模型 1：會議
欄位：
  - title（文字）
  - date（日期）
  - attendees（文字）
  - transcript（長文字）
  - summary（長文字）
  - actionItemsGenerated（核取方塊）

模型 2：任務
欄位：
  - title（文字）
  - description（長文字）
  - assignee（文字）
  - dueDate（日期）
  - sourceMeeting（關聯 → 會議）
  - status（選擇：待辦、進行中、完成）
```

**動作**：處理會議記錄

```
步驟 1：AI 推理 - 生成摘要
  輸入：transcript
  提示：「用 3 段總結此會議記錄：
           1. 做出的關鍵決策
           2. 重要討論
           3. 後續步驟
           記錄：{transcript}」
  輸出：summary

步驟 2：AI 推理 - 提取行動項目
  輸入：transcript
  提示：「從會議中提取行動項目。
           對每個項目，提供：
           - 任務標題
           - 指派人（從與會者）
           - 建議截止日期
           
           以 JSON 陣列輸出」
  輸出：Temp.actionItems

步驟 3：建立任務記錄
  對 actionItems 中的每個項目：
    建立記錄：任務
    將 JSON 解析為欄位

步驟 4：更新會議
  actionItemsGenerated：true
```

---

## 分析與報告

### 使用案例 9：社交媒體效能儀表板

**目標**：聚合所有平台的指標，生成洞察。

#### 設定

**模型**：

```
模型：社交分析
欄位：
  - date（日期）
  - platform（選擇）
  - posts（數字）
  - totalLikes（數字）
  - totalComments（數字）
  - totalShares（數字）
  - engagement_rate（數字）
  - insights（長文字）
```

**動作**：獲取每日分析

```
對每個平台：
  步驟 1：API 呼叫 - 獲取指標
    連接：平台 API
    端點：/insights
    期間：昨天
  
  步驟 2：建立分析記錄
    解析 API 回應
    儲存指標
  
  步驟 3：AI 推理 - 生成洞察
    輸入：metrics
    提示：「分析這些社交媒體指標：
             {metrics}
             提供：
             - 效能摘要
             - 顯著趨勢
             - 建議」
    輸出：insights
```

**排程**：每天晚上 11:00

```
動作：獲取每日分析
生成昨天的分析報告
```

---

## 最佳實踐

### 關鍵模式

1. **模組化動作**：將複雜的工作流程分解為較小的動作
2. **錯誤處理**：始終包含後備和重試
3. **排程**：使用排程進行批次處理
4. **AI 增強**：使用 AI 進行內容生成和分析
5. **API 整合**：連接外部服務以擴展功能
6. **子記錄**：建立相關記錄以維護關聯
7. **狀態追蹤**：使用狀態欄位控制流程
8. **篩選**：在排程中使用精確的篩選器
9. **通知**：讓利害關係人知情
10. **分析**：追蹤和分析效能

## 下一步

- [最佳實踐](./14-best-practices.md) - 優化技術
- [疑難排解](./16-troubleshooting.md) - 解決常見問題
- [動作](./09-actions.md) - 建立您自己的工作流程
