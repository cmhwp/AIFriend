// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package user

import (
	"net/http"
	"path"
	"path/filepath"

	"aifriend/internal/svc"
)

// 获取头像文件
func ServeAvatarHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uploadDir := svcCtx.Config.Upload.AvatarDir
		if uploadDir == "" {
			uploadDir = "uploads/avatars"
		}

		filename := path.Base(r.URL.Path)
		if filename == "." || filename == "/" {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		http.ServeFile(w, r, filepath.Join(uploadDir, filename))
	}
}
