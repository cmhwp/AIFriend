// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"context"
	"errors"

	"aifriend/internal/model"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type GetCharacterLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 获取单个角色
func NewGetCharacterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCharacterLogic {
	return &GetCharacterLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCharacterLogic) GetCharacter(req *types.CharacterIdReq) (resp *types.DataResp, err error) {
	userId, err := userIdFromContext(l.ctx)
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	var character model.Character
	if err := l.svcCtx.DB.First(&character, req.Id).Error; err != nil {
		return &types.DataResp{
			Code:    404,
			Message: "角色不存在",
		}, nil
	}

	// 验证所有权
	if character.UserId != userId {
		return &types.DataResp{
			Code:    403,
			Message: "无权访问此角色",
		}, nil
	}

	return &types.DataResp{
		Code:    0,
		Message: "获取成功",
		Data: types.CharacterInfo{
			Id:              character.Id,
			Name:            character.Name,
			Photo:           character.Photo,
			Profile:         character.Profile,
			BackgroundImage: character.BackgroundImage,
			CreatedAt:       character.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:       character.UpdatedAt.Format("2006-01-02 15:04:05"),
		},
	}, nil
}
