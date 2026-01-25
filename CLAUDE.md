# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIFriend 是一个全栈应用，包含 go-zero 后端和 Next.js 前端，提供用户认证和 AI 伙伴功能。

## Build & Run Commands

### 后端 (backend/)

```bash
cd backend

# 下载依赖
go mod tidy

# 构建项目
go build -o aifriend.exe .

# 运行服务 (端口 8888)
./aifriend.exe -f etc/aifriend-api.yaml

# 生成API代码(修改api定义后)
goctl api go -api api/aifriend.api -dir . -style goZero
```

### 前端 (frontend/)

```bash
cd frontend

# 安装依赖
npm install

# 开发模式 (端口 3000)
npm run dev

# 构建生产版本
npm run build

# 添加 shadcn/ui 组件
npx shadcn@latest add <component-name>
```

## Architecture

```
AIFriend/
├── backend/                    # Go后端
│   ├── aifriend.go            # 主入口
│   ├── api/aifriend.api       # API定义(go-zero DSL)
│   ├── etc/aifriend-api.yaml  # 配置文件
│   └── internal/
│       ├── config/            # 配置结构体
│       ├── handler/           # HTTP处理器(自动生成)
│       ├── logic/             # 业务逻辑(主要编辑区)
│       ├── middleware/        # CORS中间件
│       ├── model/             # GORM数据模型
│       ├── pkg/jwt/           # JWT工具
│       ├── svc/               # 服务上下文
│       └── types/             # 类型定义(自动生成)
│
└── frontend/                   # Next.js前端
    ├── app/
    │   ├── page.tsx           # 首页(已登录/未登录两种视图)
    │   └── (auth)/
    │       ├── login/         # 登录页
    │       └── register/      # 注册页
    ├── components/ui/         # shadcn/ui组件
    └── lib/
        ├── api.ts             # API客户端(封装fetch+JWT)
        └── utils.ts           # 工具函数
```

## Key Patterns

### 后端
- **API定义**: 修改 `api/aifriend.api` 后运行 goctl 重新生成
- **业务逻辑**: 在 `internal/logic/` 下实现
- **认证**: JWT双令牌(AccessToken 2h + RefreshToken 7d)
- **数据库**: GORM自动迁移
- **CORS**: 使用 `rest.WithCustomCors()` 配置

### 前端
- **UI组件**: shadcn/ui + Tailwind CSS
- **API调用**: `lib/api.ts` 封装了所有后端接口
- **Token管理**: localStorage 存储，api.ts 自动附加 Authorization 头
- **路由**: Next.js App Router，(auth) 路由组用于登录注册

## Configuration

### 后端配置 (etc/aifriend-api.yaml)
- `Auth`: JWT密钥和过期时间
- `MySQL.DataSource`: 数据库连接串
- `Cors.AllowOrigins`: 允许的前端域名

### 前端环境变量
- `NEXT_PUBLIC_API_URL`: 后端API地址(默认 http://localhost:8888)

## API Endpoints

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/v1/auth/register | 用户注册 | 否 |
| POST | /api/v1/auth/login | 用户登录 | 否 |
| POST | /api/v1/auth/refresh | 刷新Token | 否 |
| GET | /api/v1/user/info | 获取用户信息 | 是 |
| PUT | /api/v1/user/info | 更新用户信息 | 是 |
| POST | /api/v1/user/password | 修改密码 | 是 |
