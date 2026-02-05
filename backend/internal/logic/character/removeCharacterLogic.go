// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"context"
	"errors"
	"os"
	"path/filepath"

	"aifriend/internal/model"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type RemoveCharacterLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 删除角色
func NewRemoveCharacterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *RemoveCharacterLogic {
	return &RemoveCharacterLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *RemoveCharacterLogic) RemoveCharacter(req *types.CharacterIdReq) (resp *types.BaseResp, err error) {
	userId, err := userIdFromContext(l.ctx)
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	var character model.Character
	if err := l.svcCtx.DB.First(&character, req.Id).Error; err != nil {
		return &types.BaseResp{
			Code:    404,
			Message: "角色不存在",
		}, nil
	}

	// 验证所有权
	if character.UserId != userId {
		return &types.BaseResp{
			Code:    403,
			Message: "无权删除此角色",
		}, nil
	}

	uploadDir := l.svcCtx.Config.Upload.CharacterDir
	if uploadDir == "" {
		uploadDir = "uploads/characters"
	}

	// 删除关联的图片文件
	if character.Photo != "" {
		os.Remove(filepath.Join(uploadDir, filepath.Base(character.Photo)))
	}
	if character.BackgroundImage != "" {
		os.Remove(filepath.Join(uploadDir, filepath.Base(character.BackgroundImage)))
	}

	// 删除角色记录
	if err := l.svcCtx.DB.Delete(&character).Error; err != nil {
		return nil, errors.New("删除角色失败")
	}

	return &types.BaseResp{
		Code:    0,
		Message: "删除成功",
	}, nil
}
