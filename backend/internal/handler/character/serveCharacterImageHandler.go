// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"net/http"
	"path"
	"path/filepath"

	"aifriend/internal/svc"
)

// 获取角色图片文件
func ServeCharacterImageHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		uploadDir := svcCtx.Config.Upload.CharacterDir
		if uploadDir == "" {
			uploadDir = "uploads/characters"
		}

		filename := path.Base(r.URL.Path)
		if filename == "." || filename == "/" {
			w.WriteHeader(http.StatusNotFound)
			return
		}

		http.ServeFile(w, r, filepath.Join(uploadDir, filename))
	}
}
