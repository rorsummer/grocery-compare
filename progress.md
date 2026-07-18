# 进度日志

## 会话：2026-07-18 (Session 1)

### 阶段 1-6：全部完成
- **状态：** complete
- 所有开发工作已完成
- 三超市 API (Woolworths + Pak'nSave + New World) 全部正常返回数据
- 前端含中文搜索、语言切换、定位、PWA 支持
- 测试结果：搜索 "milk" 返回 18 个结果，三超市价格从 $2.09 到 $7.33

### 阶段 7：部署
- **状态：** in_progress
- Git 仓库已初始化并推送到 https://github.com/rorsummer/grocery-compare
- 等待用户操作 Vercel 部署

## 会话：2026-07-18 (Session 2)

### 中英文搜索优化
- **状态：** complete
- 添加 relevanceScore() 函数：多词匹配 + 精确短语匹配
- 修复中文搜索相关性：使用翻译后的英文关键词做匹配
- 翻译库从 35 个品类扩展到 80+，包含 400+ 关键词
- 添加英文→中文反向查找，支持 n-gram 部分匹配
- 关键词上限 3 个，防止超时
- 多词搜索零相关性过滤
- 价格模式按相关性分层排序
- 最佳匹配权重：价格 55% + 距离 30% + 相关性 15%

### 测试结果（全部 PASS）
| 测试 | 结果数 | 顶部结果 | 相关性 |
|------|-------|---------|--------|
| 奶粉 | 39 | anchor milk powder instant $10.49 | rel=1.2 |
| 酱油 | 36 | Delicous Light Soy Cooking Sauce $1.99 | rel=1.0 |
| 巧克力 | 96 | anchor calci yum flavoured milk chocolate | rel=1.1 |
| 洗发水 | 82 | Fruits Wild Berry Shampoo | rel=1.1 |
| 方便面 | 59 | choice instant noodles chicken cup | rel=1.2 |
| 牛油果 | 40 | Avocado | rel=1.1 |

### 构建验证
- npm run build: PASS (Compiled successfully, Next.js 15.5.20)
- Git push: dc236d9 推送到 master

## 项目结构
```
奥大超市/
├── src/
│   ├── app/
│   │   ├── api/search/route.ts   ← 搜索 API
│   │   ├── layout.tsx             ← 根布局 + PWA meta
│   │   ├── page.tsx               ← 搜索页面
│   │   └── globals.css
│   ├── data/
│   │   ├── translations.ts        ← 中英文对照 (40+ 商品)
│   │   └── stores.ts             ← 奥克兰超市坐标 (30+ 门店)
│   └── lib/
│       ├── scrapers.ts            ← 三超市爬虫 (Woolworths/PNS/NW)
│       └── location.ts            ← 地理位置获取
├── public/
│   ├── manifest.json              ← PWA 配置
│   ├── icon-192.png / icon-512.png
├── scripts/generate-icons.js
└── package.json
```

## 测试结果
| 测试 | 输入 | 预期结果 | 实际结果 | 状态 |
|------|------|---------|---------|------|
| 构建编译 | npm run build | 零错误 | 编译成功 | PASS |
| Woolworths API | searchCountdown("milk") | 商品数据 | $2.26~$7.33, 7件商品 | PASS |
| Pak'nSave API | searchPaknsave("milk") | 商品数据 | $2.09~$5.85, 6件商品 | PASS |
| New World API | searchNewWorld("milk") | 商品数据 | $2.39~$4.92, 5件商品 | PASS |
| 聚合搜索 | /api/search?q=milk | 三超市结果 | 18件商品, 三超市齐全 | PASS |
| 中文搜索 | /api/search?q=牛奶 | 翻译后搜索 | 同 milk 结果 | PASS |
| 定位功能 | 点击定位按钮 | 附近超市列表 | 显示距离和门店 | PASS |

## 错误日志
| 时间戳 | 错误 | 尝试次数 | 解决方案 |
|--------|------|---------|---------|
| 2026-07-18 | create-next-app 拒绝中文目录名 | 1 | 手动搭建项目 |
| 2026-07-18 | Woolworths API 400 错误 | 1 | 添加 Origin/Referer/X-Requested-With Headers |
| 2026-07-18 | Pak'nSave/New World API 空数据 | 2 | 使用 curl 获取 guest token + api-prod 域名 + Bearer 认证 |
| 2026-07-18 | /dev/null 在 Windows 不存在 | 1 | 使用 os.devNull |
| 2026-07-18 | 端口 3000 被占用 | 1 | 改用端口 3001 |

## 五问重启检查
| 问题 | 答案 |
|------|------|
| 我在哪里？ | 阶段 7 - 等待 Vercel 部署 |
| 我要去哪里？ | 完成部署上线 |
| 目标是什么？ | 构建奥克兰超市比价搜索网站 |
| 我学到了什么？ | 见 findings.md |
| 我做了什么？ | 完成全部开发，代码已推送到 GitHub |

---
*每个阶段完成后或遇到错误时更新此文件*
