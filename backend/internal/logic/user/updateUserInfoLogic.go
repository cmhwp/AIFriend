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
	userId, err := l.ctx.Value("userId").(json.Number).Int64()
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	// 构建更新数据
	updates := make(map[string]interface{})
	if req.Email != "" {
		updates["email"] = req.Email
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
