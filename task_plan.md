# 任务计划：奥克兰超市比价网页应用

## 目标
构建一个支持中英文搜索的奥克兰超市商品比价网站，用户可以搜索商品（如"牛奶"、"milk"），查看附近超市的价格并按价格排序。

## 当前阶段
阶段 7（部署中，等待用户操作 Vercel）

## 各阶段

### 阶段 1：环境准备与项目初始化
- [x] Node.js 已安装 (v24.15.0)
- [x] 用户已完成 GitHub、Vercel 注册
- [x] 创建 Next.js 项目 (TypeScript + Tailwind)
- [x] 验证项目能正常启动
- **状态：** complete

### 阶段 2：数据爬虫
- [x] 实现 Countdown (Woolworths NZ) 商品搜索爬虫
- [x] 实现 Pak'nSave 商品搜索爬虫
- [x] 实现 New World 商品搜索爬虫
- [x] 验证三个超市 API 均返回真实商品和价格
- **状态：** complete

### 阶段 3：后端搜索 API
- [x] 建中英文翻译对照表（40+ 商品）
- [x] 实现 `/api/search` 搜索接口
- [x] 聚合三家超市结果并按价格排序
- [x] 测试 API 返回真实 JSON 数据
- **状态：** complete

### 阶段 4：前端搜索页面
- [x] 实现搜索框 + 搜索结果列表
- [x] 中英文语言切换
- [x] 加载状态和无结果状态
- [x] 响应式设计适配手机
- **状态：** complete

### 阶段 5：附近超市定位
- [x] 获取用户地理位置函数
- [x] 建立奥克兰超市坐标数据库（30+ 超市）
- [x] 计算距离函数
- [x] 前端集成定位按钮和附近超市显示
- **状态：** complete

### 阶段 6：PWA 支持
- [x] 添加 manifest.json
- [x] 生成图标（192x192、512x512）
- [x] 配置 appleWebApp 和 viewport
- **状态：** complete

### 阶段 7：部署上线
- [x] 初始化 Git 仓库
- [x] 推送到 GitHub (https://github.com/rorsummer/grocery-compare)
- [ ] 部署到 Vercel（用户操作中）
- **状态：** in_progress

## 关键问题
1. ~~超市 API 接口地址可能已变更~~ → 已解决：Woolworths 需要特定 Headers；Foodstuffs 使用 api-prod 域名 + Bearer token
2. ~~爬虫可能被超市网站限流~~ → 已解决：使用 curl 绕过 Cloudflare，token 缓存 25 分钟
3. Vercel Serverless 环境下 curl 可能不可用 → 需要注意 curl 在新西兰 Vercel 区域是否可用

## 已做决策
| 决策 | 理由 |
|------|------|
| 使用 Next.js (App Router) | 支持 API Routes + 前端一体，部署简单 |
| 使用 TypeScript | 类型安全，减少运行时错误 |
| 使用 Tailwind CSS v4 | 快速构建响应式 UI |
| Foodstuffs API 使用 curl 绕过 Cloudflare | Node.js fetch 被 Cloudflare 拦截 |
| Guest token 缓存 25 分钟 | 减少 token 请求次数 |
| 默认门店 Royal Oak / Metro Auckland | 奥克兰中心区域，价格有代表性 |

## 遇到的错误
| 错误 | 尝试次数 | 解决方案 |
|------|---------|---------|
| create-next-app 拒绝中文目录名 | 1 | 手动搭建项目结构 |
| 超市 API 返回空数据 | 2 | Woolworths: 添加 Origin/Referer Headers；Foodstuffs: 用 curl 获取 guest token + api-prod 域名 |
| /dev/null 路径在 Windows 不存在 | 1 | 使用 os.devNull 替换 |
| 开发服务器端口冲突 | 1 | 关闭旧进程改用新端口 |

## 备注
- 项目目录：C:\Users\周笑语\Desktop\奥大超市
- GitHub：https://github.com/rorsummer/grocery-compare
- 超市 API：Woolworths (woolworths.co.nz API)、Foodstuffs (paknsave.co.nz / newworld.co.nz api-prod)
