# AIFriend

基于 go-zero 框架的后端服务，提供用户认证和管理功能。

## 技术栈

- **框架**: go-zero v1.9.2
- **数据库**: MySQL + GORM
- **认证**: JWT (双令牌机制)
- **工具**: goctl

## 快速开始

### 环境要求

- Go 1.21+
- MySQL 8.0+
- goctl (`go install github.com/zeromicro/go-zero/tools/goctl@latest`)

### 安装运行

```bash
# 1. 创建数据库
mysql -u root -p -e "CREATE DATABASE aifriend CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 修改配置
# 编辑 backend/etc/aifriend-api.yaml，配置数据库连接和JWT密钥

# 3. 进入项目目录
cd backend

# 4. 下载依赖
go mod tidy

# 5. 运行服务
go run aifriend.go

# 或者编译后运行
go build -o aifriend.exe .
./aifriend.exe
```

服务启动后访问 `http://localhost:8888`

## 配置说明

配置文件位于 `backend/etc/aifriend-api.yaml`：

```yaml
Name: aifriend-api
Host: 0.0.0.0
Port: 8888

Auth:
  AccessSecret: "your-access-secret-key"    # 生产环境请更换
  AccessExpire: 7200                         # 访问令牌过期时间(秒)
  RefreshSecret: "your-refresh-secret-key"  # 生产环境请更换
  RefreshExpire: 604800                      # 刷新令牌过期时间(秒)

MySQL:
  DataSource: "root:password@tcp(127.0.0.1:3306)/aifriend?charset=utf8mb4&parseTime=True&loc=Asia%2FShanghai"

Cors:
  AllowOrigins:
    - "http://localhost:5173"
  AllowCredentials: true
```

## API 接口

### 认证相关

#### 用户注册
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456",
  "email": "test@example.com"  // 可选
}
```

#### 用户登录
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "testuser",
  "password": "123456"
}

// 响应
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 7200
}
```

#### 刷新令牌
```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

### 用户相关 (需要认证)

请求头需携带: `Authorization: Bearer <access_token>`

#### 获取用户信息
```
GET /api/v1/user/info
```

#### 更新用户信息
```
PUT /api/v1/user/info
Content-Type: application/json

{
  "email": "new@example.com",
  "avatar": "https://example.com/avatar.png"
}
```

#### 修改密码
```
POST /api/v1/user/password
Content-Type: application/json

{
  "old_password": "123456",
  "new_password": "654321"
}
```

## 项目结构

```
backend/
├── aifriend.go              # 主入口
├── api/
│   └── aifriend.api         # API定义文件
├── etc/
│   └── aifriend-api.yaml    # 配置文件
└── internal/
    ├── config/              # 配置结构体
    ├── handler/             # HTTP处理器 (goctl生成)
    ├── logic/               # 业务逻辑 (主要开发区域)
    ├── middleware/          # 中间件
    ├── model/               # 数据模型
    ├── pkg/                 # 工具包
    ├── svc/                 # 服务上下文
    └── types/               # 类型定义 (goctl生成)
```

## 开发指南

### 添加新接口

1. 在 `api/aifriend.api` 中定义接口
2. 运行 `goctl api go -api api/aifriend.api -dir . -style goZero`
3. 在 `internal/logic/` 中实现业务逻辑

### 添加新模型

1. 在 `internal/model/` 中定义模型
2. 在 `internal/svc/serviceContext.go` 的 `AutoMigrate` 中添加模型

## License

MIT
