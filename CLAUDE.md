# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

AIFriend 是一个基于 go-zero 框架的后端服务，提供用户认证和管理功能。

## Build & Run Commands

```bash
# 下载依赖
go mod tidy

# 构建项目
go build -o aifriend.exe .

# 运行服务
./aifriend.exe -f etc/aifriend-api.yaml

# 生成API代码(修改api定义后)
goctl api go -api api/aifriend.api -dir . -style goZero
```

## Architecture

```
backend/
├── aifriend.go           # 主入口
├── api/
│   └── aifriend.api      # API定义文件(go-zero DSL)
├── etc/
│   └── aifriend-api.yaml # 配置文件(JWT、MySQL、CORS)
└── internal/
    ├── config/           # 配置结构体
    ├── handler/          # HTTP处理器(自动生成)
    │   ├── auth/         # 认证相关handler
    │   └── user/         # 用户相关handler
    ├── logic/            # 业务逻辑(主要编辑区)
    │   ├── auth/         # 注册、登录、刷新token
    │   └── user/         # 用户信息CRUD
    ├── middleware/       # 中间件(CORS)
    ├── model/            # 数据模型(GORM)
    ├── pkg/jwt/          # JWT工具
    ├── svc/              # 服务上下文(DB连接)
    └── types/            # 请求/响应类型(自动生成)
```

## Key Patterns

- **API定义**: 修改 `api/aifriend.api` 后运行 goctl 重新生成
- **业务逻辑**: 在 `internal/logic/` 下实现，handler会自动调用
- **认证**: JWT双令牌机制(AccessToken 2h + RefreshToken 7d)
- **数据库**: GORM自动迁移，模型在 `internal/model/`
- **用户ID获取**: 从JWT解析后存入context，通过 `ctx.Value("userId")` 获取

## Configuration

配置文件 `etc/aifriend-api.yaml`:
- `Auth`: JWT密钥和过期时间
- `MySQL.DataSource`: 数据库连接串
- `Cors.AllowOrigins`: 允许的前端域名

## API Endpoints

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | /api/v1/auth/register | 用户注册 | 否 |
| POST | /api/v1/auth/login | 用户登录 | 否 |
| POST | /api/v1/auth/refresh | 刷新Token | 否 |
| GET | /api/v1/user/info | 获取用户信息 | 是 |
| PUT | /api/v1/user/info | 更新用户信息 | 是 |
| POST | /api/v1/user/password | 修改密码 | 是 |
