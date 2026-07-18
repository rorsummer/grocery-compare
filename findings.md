# 发现与决策

## 需求
- 用户输入商品名（支持中英文）→ 显示附近超市价格，按价格排序
- 覆盖超市：Pak'nSave、Countdown/Woolworths、New World、华人超市
- 需要支持定位功能，显示附近超市距离

## 研究发现
- Countdown (Woolworths NZ) 有非官方 API: `woolworths.co.nz/api/v1/products`
- Pak'nSave 使用 Foodstuffs API: `paknsave.co.nz/next/api/productsearch`
- 超市 API 地址可能随时变更，需要定期验证
- Next.js 的 API Routes 适合做后端代理，避免前端直接请求超市 API 的跨域问题

## 技术决策
| 决策 | 理由 |
|------|------|
| Next.js (App Router) + TypeScript | API Routes 一体，部署简单，类型安全 |
| Tailwind CSS | 快速构建响应式 UI |
| 实时爬取 API，不做数据库缓存 | MVP 阶段优先验证可行性 |
| PWA 方案替代原生 App | 开发成本低，跨平台 |
| 中英文翻译用本地 JSON 对照表 | 避免依赖外部翻译 API，降低延迟和成本 |

## 遇到的问题
| 问题 | 解决方案 |
|------|---------|
|      |         |

## 资源
- Countdown API: https://www.woolworths.co.nz/api/v1/products
- Pak'nSave API: https://www.paknsave.co.nz/next/api/productsearch
- 用户提供的完整开发指南

## 视觉/浏览器发现
- 暂无（尚未开始实现）

---
*每执行2次查看/浏览器/搜索操作后更新此文件*
*防止视觉信息丢失*
