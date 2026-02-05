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

type GetCharacterListLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 获取角色列表
func NewGetCharacterListLogic(ctx context.Context, svcCtx *svc.ServiceContext) *GetCharacterListLogic {
	return &GetCharacterListLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *GetCharacterListLogic) GetCharacterList() (resp *types.DataResp, err error) {
	userId, err := userIdFromContext(l.ctx)
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	var characters []model.Character
	if err := l.svcCtx.DB.Where("user_id = ?", userId).Order("created_at DESC").Find(&characters).Error; err != nil {
		return nil, errors.New("查询角色列表失败")
	}

	list := make([]types.CharacterInfo, len(characters))
	for i, c := range characters {
		list[i] = types.CharacterInfo{
			Id:              c.Id,
			Name:            c.Name,
			Photo:           c.Photo,
			Profile:         c.Profile,
			BackgroundImage: c.BackgroundImage,
			CreatedAt:       c.CreatedAt.Format("2006-01-02 15:04:05"),
			UpdatedAt:       c.UpdatedAt.Format("2006-01-02 15:04:05"),
		}
	}

	return &types.DataResp{
		Code:    0,
		Message: "获取成功",
		Data:    list,
	}, nil
}
