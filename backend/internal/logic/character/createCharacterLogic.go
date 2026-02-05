// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"aifriend/internal/model"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

var allowedImageTypes = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/gif":  "gif",
	"image/webp": "webp",
}

type CreateCharacterLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 创建角色
func NewCreateCharacterLogic(ctx context.Context, svcCtx *svc.ServiceContext) *CreateCharacterLogic {
	return &CreateCharacterLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *CreateCharacterLogic) CreateCharacter(name, profile string, photoHeader, bgHeader *multipart.FileHeader) (resp *types.DataResp, err error) {
	userId, err := userIdFromContext(l.ctx)
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	// 验证必填字段
	name = strings.TrimSpace(name)
	if name == "" {
		return &types.DataResp{
			Code:    400,
			Message: "角色名称不能为空",
		}, nil
	}

	uploadDir := l.svcCtx.Config.Upload.CharacterDir
	if uploadDir == "" {
		uploadDir = "uploads/characters"
	}

	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return nil, errors.New("创建上传目录失败")
	}

	// 处理角色头像
	var photoPath string
	if photoHeader != nil {
		path, err := l.saveFile(photoHeader, uploadDir, userId, "photo")
		if err != nil {
			return &types.DataResp{
				Code:    400,
				Message: err.Error(),
			}, nil
		}
		photoPath = path
	}

	// 处理背景图
	var bgPath string
	if bgHeader != nil {
		path, err := l.saveFile(bgHeader, uploadDir, userId, "bg")
		if err != nil {
			// 如果保存背景图失败，删除已上传的头像
			if photoPath != "" {
				os.Remove(filepath.Join(uploadDir, filepath.Base(photoPath)))
			}
			return &types.DataResp{
				Code:    400,
				Message: err.Error(),
			}, nil
		}
		bgPath = path
	}

	// 创建角色记录
	character := &model.Character{
		UserId:          userId,
		Name:            name,
		Profile:         profile,
		Photo:           photoPath,
		BackgroundImage: bgPath,
	}

	if err := l.svcCtx.DB.Create(character).Error; err != nil {
		// 删除已上传的文件
		if photoPath != "" {
			os.Remove(filepath.Join(uploadDir, filepath.Base(photoPath)))
		}
		if bgPath != "" {
			os.Remove(filepath.Join(uploadDir, filepath.Base(bgPath)))
		}
		return nil, errors.New("创建角色失败")
	}

	return &types.DataResp{
		Code:    0,
		Message: "创建成功",
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

func (l *CreateCharacterLogic) saveFile(fileHeader *multipart.FileHeader, uploadDir string, userId int64, prefix string) (string, error) {
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

func detectFileType(fileHeader *multipart.FileHeader) (string, error) {
	file, err := fileHeader.Open()
	if err != nil {
		return "", err
	}
	defer file.Close()

	buffer := make([]byte, 512)
	n, err := file.Read(buffer)
	if err != nil && err != io.EOF {
		return "", err
	}

	return http.DetectContentType(buffer[:n]), nil
}

func randomHex(length int) (string, error) {
	if length <= 0 {
		return "", errors.New("invalid length")
	}
	buffer := make([]byte, length)
	if _, err := rand.Read(buffer); err != nil {
		return "", err
	}
	return hex.EncodeToString(buffer), nil
}
