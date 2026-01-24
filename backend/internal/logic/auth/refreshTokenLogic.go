// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package auth

import (
	"context"
	"errors"

	"aifriend/internal/pkg/jwt"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type RefreshTokenLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 刷新Token
func NewRefreshTokenLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RefreshTokenLogic {
	return &RefreshTokenLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *RefreshTokenLogic) RefreshToken(req *types.RefreshTokenReq) (resp *types.TokenResp, err error) {
	// 解析刷新令牌
	claims, err := jwt.ParseToken(req.RefreshToken, l.svcCtx.Config.Auth.RefreshSecret)
	if err != nil {
		return nil, errors.New("无效的刷新令牌")
	}

	// 生成新的访问令牌
	accessToken, err := jwt.GenerateToken(
		claims.UserId,
		claims.Username,
		l.svcCtx.Config.Auth.AccessSecret,
		l.svcCtx.Config.Auth.AccessExpire,
	)
	if err != nil {
		return nil, errors.New("生成令牌失败")
	}

	// 生成新的刷新令牌
	refreshToken, err := jwt.GenerateToken(
		claims.UserId,
		claims.Username,
		l.svcCtx.Config.Auth.RefreshSecret,
		l.svcCtx.Config.Auth.RefreshExpire,
	)
	if err != nil {
		return nil, errors.New("生成刷新令牌失败")
	}

	return &types.TokenResp{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    l.svcCtx.Config.Auth.AccessExpire,
	}, nil
}
