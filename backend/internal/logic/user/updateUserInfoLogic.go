// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package user

import (
	"context"
	"errors"
	"strings"

	"aifriend/internal/model"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
	"gorm.io/gorm"
)

type UpdateUserInfoLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 更新用户信息
func NewUpdateUserInfoLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateUserInfoLogic {
	return &UpdateUserInfoLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateUserInfoLogic) UpdateUserInfo(req *types.UpdateUserReq) (resp *types.BaseResp, err error) {
	// 从context中获取用户ID
	userId, err := userIdFromContext(l.ctx)
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	// 构建更新数据
	updates := make(map[string]interface{})
	if req.Username != "" {
		username := strings.TrimSpace(req.Username)
		if username == "" {
			return &types.BaseResp{
				Code:    400,
				Message: "用户名不能为空",
			}, nil
		}

		var existing model.User
		if err := l.svcCtx.DB.Where("username = ? AND id <> ?", username, userId).First(&existing).Error; err == nil {
			return &types.BaseResp{
				Code:    400,
				Message: "用户名已存在",
			}, nil
		} else if !errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("查询用户名失败")
		}

		updates["username"] = username
	}

	email := strings.TrimSpace(req.Email)
	if email != "" {
		updates["email"] = email
	}
	if req.Avatar != "" {
		updates["avatar"] = req.Avatar
	}

	if len(updates) == 0 {
		return &types.BaseResp{
			Code:    400,
			Message: "没有需要更新的数据",
		}, nil
	}

	// 更新用户信息
	if err := l.svcCtx.DB.Model(&model.User{}).Where("id = ?", userId).Updates(updates).Error; err != nil {
		return nil, errors.New("更新用户信息失败")
	}

	return &types.BaseResp{
		Code:    0,
		Message: "更新成功",
	}, nil
}
