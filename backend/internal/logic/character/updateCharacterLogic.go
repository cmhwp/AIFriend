// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"context"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"

	"aifriend/internal/model"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type UpdateCharacterLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 更新角色
func NewUpdateCharacterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UpdateCharacterLogic {
	return &UpdateCharacterLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UpdateCharacterLogic) UpdateCharacter(characterId int64, name, profile string, photoHeader, bgHeader *multipart.FileHeader) (resp *types.DataResp, err error) {
	userId, err := userIdFromContext(l.ctx)
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	// 查找角色
	var character model.Character
	if err := l.svcCtx.DB.First(&character, characterId).Error; err != nil {
		return &types.DataResp{
			Code:    404,
			Message: "角色不存在",
		}, nil
	}

	// 验证所有权
	if character.UserId != userId {
		return &types.DataResp{
			Code:    403,
			Message: "无权操作此角色",
		}, nil
	}

	uploadDir := l.svcCtx.Config.Upload.CharacterDir
	if uploadDir == "" {
		uploadDir = "uploads/characters"
	}

	// 更新字段
	updates := make(map[string]interface{})

	name = strings.TrimSpace(name)
	if name != "" {
		updates["name"] = name
	}

	if profile != "" {
		updates["profile"] = profile
	}

	// 处理新头像
	if photoHeader != nil {
		if err := os.MkdirAll(uploadDir, 0o755); err != nil {
			return nil, errors.New("创建上传目录失败")
		}

		path, err := l.saveFile(photoHeader, uploadDir, userId, "photo")
		if err != nil {
			return &types.DataResp{
				Code:    400,
				Message: err.Error(),
			}, nil
		}

		// 删除旧头像
		if character.Photo != "" {
			oldPath := filepath.Join(uploadDir, filepath.Base(character.Photo))
			os.Remove(oldPath)
		}

		updates["photo"] = path
	}

	// 处理新背景图
	if bgHeader != nil {
		if err := os.MkdirAll(uploadDir, 0o755); err != nil {
			return nil, errors.New("创建上传目录失败")
		}

		path, err := l.saveFile(bgHeader, uploadDir, userId, "bg")
		if err != nil {
			return &types.DataResp{
				Code:    400,
				Message: err.Error(),
			}, nil
		}

		// 删除旧背景图
		if character.BackgroundImage != "" {
			oldPath := filepath.Join(uploadDir, filepath.Base(character.BackgroundImage))
			os.Remove(oldPath)
		}

		updates["background_image"] = path
	}

	if len(updates) == 0 {
		return &types.DataResp{
			Code:    400,
			Message: "没有需要更新的数据",
		}, nil
	}

	if err := l.svcCtx.DB.Model(&character).Updates(updates).Error; err != nil {
		return nil, errors.New("更新角色失败")
	}

	// 重新查询获取最新数据
	l.svcCtx.DB.First(&character, characterId)

	return &types.DataResp{
		Code:    0,
		Message: "更新成功",
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

func (l *UpdateCharacterLogic) saveFile(fileHeader *multipart.FileHeader, uploadDir string, userId int64, prefix string) (string, error) {
	maxSize := l.svcCtx.Config.Upload.MaxCharacterSize
	if maxSize <= 0 {
		maxSize = 5 * 1024 * 1024
	}

	if fileHeader.Size > maxSize {
		return "", fmt.Errorf("图片大小不能超过%dMB", maxSize/1024/1024)
	}

	contentType, err := detectFileType(fileHeader)
	if err != nil {
		return "", errors.New("读取文件失败")
	}

	extension, ok := allowedImageTypes[contentType]
	if !ok {
		return "", errors.New("仅支持 JPG、PNG、GIF、WEBP 格式")
	}

	randomSuffix, err := randomHex(8)
	if err != nil {
		return "", errors.New("生成文件名失败")
	}

	filename := fmt.Sprintf("char_%s_%d_%s.%s", prefix, userId, randomSuffix, extension)
	filePath := filepath.Join(uploadDir, filename)

	source, err := fileHeader.Open()
	if err != nil {
		return "", errors.New("读取文件失败")
	}
	defer source.Close()

	target, err := os.Create(filePath)
	if err != nil {
		return "", errors.New("保存文件失败")
	}
	defer target.Close()

	if _, err := io.Copy(target, source); err != nil {
		return "", errors.New("保存文件失败")
	}

	return fmt.Sprintf("/api/v1/uploads/characters/%s", filename), nil
}
