// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package user

import (
	"context"
	"encoding/json"
	"errors"

	"aifriend/internal/model"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
	"golang.org/x/crypto/bcrypt"
)

type ChangePasswordLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 修改密码
func NewChangePasswordLogic(ctx context.Context, svcCtx *svc.ServiceContext) *ChangePasswordLogic {
	return &ChangePasswordLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *ChangePasswordLogic) ChangePassword(req *types.ChangePasswordReq) (resp *types.BaseResp, err error) {
	// 从context中获取用户ID
	userId, err := l.ctx.Value("userId").(json.Number).Int64()
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	// 查询用户
	var user model.User
	if err := l.svcCtx.DB.First(&user, userId).Error; err != nil {
		return nil, errors.New("用户不存在")
	}

	// 验证旧密码
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.OldPassword)); err != nil {
		return &types.BaseResp{
			Code:    400,
			Message: "旧密码错误",
		}, nil
	}

	// 加密新密码
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		return nil, errors.New("密码加密失败")
	}

	// 更新密码
	if err := l.svcCtx.DB.Model(&user).Update("password", string(hashedPassword)).Error; err != nil {
		return nil, errors.New("修改密码失败")
	}

	return &types.BaseResp{
		Code:    0,
		Message: "密码修改成功",
	}, nil
}
