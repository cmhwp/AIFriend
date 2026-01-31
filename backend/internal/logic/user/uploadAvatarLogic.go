// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package user

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

	"aifriend/internal/model"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

const defaultMaxAvatarSize = int64(2 * 1024 * 1024)

var allowedAvatarTypes = map[string]string{
	"image/jpeg": "jpg",
	"image/png":  "png",
	"image/gif":  "gif",
	"image/webp": "webp",
}

type UploadAvatarLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

// 上传头像
func NewUploadAvatarLogic(ctx context.Context, svcCtx *svc.ServiceContext) *UploadAvatarLogic {
	return &UploadAvatarLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *UploadAvatarLogic) UploadAvatar(fileHeader *multipart.FileHeader) (resp *types.DataResp, err error) {
	userId, err := userIdFromContext(l.ctx)
	if err != nil {
		return nil, errors.New("无效的用户身份")
	}

	maxSize := l.svcCtx.Config.Upload.MaxAvatarSize
	if maxSize <= 0 {
		maxSize = defaultMaxAvatarSize
	}

	if fileHeader.Size > maxSize {
		return &types.DataResp{
			Code:    400,
			Message: "头像大小不能超过2MB",
		}, nil
	}

	uploadDir := l.svcCtx.Config.Upload.AvatarDir
	if uploadDir == "" {
		uploadDir = "uploads/avatars"
	}

	if err := os.MkdirAll(uploadDir, 0o755); err != nil {
		return nil, errors.New("创建上传目录失败")
	}

	contentType, err := detectFileType(fileHeader)
	if err != nil {
		return nil, errors.New("读取文件失败")
	}

	extension, ok := allowedAvatarTypes[contentType]
	if !ok {
		return &types.DataResp{
			Code:    400,
			Message: "仅支持 JPG、PNG、GIF、WEBP 格式",
		}, nil
	}

	randomSuffix, err := randomHex(8)
	if err != nil {
		return nil, errors.New("生成文件名失败")
	}

	filename := fmt.Sprintf("avatar_%d_%s.%s", userId, randomSuffix, extension)
	filePath := filepath.Join(uploadDir, filename)

	source, err := fileHeader.Open()
	if err != nil {
		return nil, errors.New("读取文件失败")
	}
	defer source.Close()

	target, err := os.Create(filePath)
	if err != nil {
		return nil, errors.New("保存文件失败")
	}
	defer target.Close()

	if _, err := io.Copy(target, source); err != nil {
		return nil, errors.New("保存文件失败")
	}

	avatarPath := fmt.Sprintf("/api/v1/uploads/avatars/%s", filename)
	if err := l.svcCtx.DB.Model(&model.User{}).Where("id = ?", userId).Update("avatar", avatarPath).Error; err != nil {
		return nil, errors.New("更新头像失败")
	}

	return &types.DataResp{
		Code:    0,
		Message: "上传成功",
		Data: map[string]string{
			"avatar": avatarPath,
		},
	}, nil
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
