// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package config

import "github.com/zeromicro/go-zero/rest"

type Config struct {
	rest.RestConf
	Auth struct {
		AccessSecret       string
		AccessExpire       int64  // 访问令牌过期时间(秒)
		RefreshSecret      string
		RefreshExpire      int64  // 刷新令牌过期时间(秒)
	}
	MySQL struct {
		DataSource string
	}
	Cors struct {
		AllowOrigins     []string
		AllowCredentials bool
	}
	Upload struct {
		AvatarDir     string
		MaxAvatarSize int64
	}
}
