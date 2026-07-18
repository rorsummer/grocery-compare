# 发现与决策

## 需求
- 用户输入商品名（支持中英文）→ 显示附近超市价格，按价格排序
- 覆盖超市：Pak'nSave、Countdown/Woolworths、New World、华人超市
- 需要支持定位功能，显示附近超市距离

## 研究发现

### Woolworths (Countdown) API
- 端点：`https://www.woolworths.co.nz/api/v1/products?target=search&search=...`
- 需要特殊 Headers：`Origin`, `Referer`, `X-Requested-With: XMLHttpRequest`
- 响应结构：`data.products.items[]` → `item.price.salePrice`, `item.images.big`
- 无需认证，直接 fetch 可用

### Foodstuffs (Pak'nSave + New World) API
- API 域名：
  - Pak'nSave: `https://api-prod.paknsave.co.nz`
  - New World: `https://api-prod.newworld.co.nz`
- 认证方式：匿名 Guest Token (JWT)，通过 curl 访问首页获取 `fs-user-token` cookie
- 为什么需要 curl：网站使用 Cloudflare 防护，Node.js fetch 被拦截（403/301）
- Token 有效期：~30 分钟，缓存在内存中
- 商品搜索：POST `/v1/edge/search/paginated/products` (Algolia 格式)
- 门店列表：GET `/v1/edge/store`
- 商品图片：`https://a.fsimg.co.nz/product/retail/fan/image/200x200/{productId}.png`
- 定价与门店绑定，不同门店价格不同
- 默认门店：Pak'nSave Royal Oak, New World Metro Auckland

### 关键 API 限制
- Pak'nSave/New World: 只读匿名访问，无法获取购物车或历史价格
- Countdown/Woolworths: 同样只读，但可以浏览商品和特价
- 这些接口是非官方的，可能随时变更

### Vercel 部署注意事项
- Foodstuffs token mint 依赖 curl（绕过 Cloudflare）
- Vercel Serverless 环境需确认 curl 可用
- 新西兰区域 (syd1) 延迟较低

## 技术决策
| 决策 | 理由 |
|------|------|
| Next.js (App Router) + TypeScript | API Routes 一体，部署简单，类型安全 |
| Tailwind CSS v4 | 快速构建响应式 UI |
| 实时 API 调用，不做数据库缓存 | MVP 阶段优先验证可行性 |
| PWA 方案替代原生 App | 开发成本低，跨平台 |
| 中英文翻译用本地 JSON 对照表 | 避免依赖外部翻译 API，降低延迟和成本 |
| 使用 @auckland-ai-collective/trundler-mcp 源码作为 API 参考 | 新西兰本地项目，已验证可用 |

## 资源
- 项目：https://github.com/rorsummer/grocery-compare
- trundler-mcp: https://github.com/auckland-ai-collective/trundler-mcp
- Woolworths: https://www.woolworths.co.nz
- Pak'nSave: https://www.paknsave.co.nz
- New World: https://www.newworld.co.nz
- Foodstuffs API: https://api-prod.paknsave.co.nz / https://api-prod.newworld.co.nz
