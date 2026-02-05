// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"net/http"

	"aifriend/internal/logic/character"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

// 创建角色 (multipart form)
func CreateCharacterHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		maxSize := svcCtx.Config.Upload.MaxCharacterSize
		if maxSize <= 0 {
			maxSize = 5 * 1024 * 1024
		}

		const maxOverhead = int64(512 * 1024)
		r.Body = http.MaxBytesReader(w, r.Body, maxSize*2+maxOverhead)
		if err := r.ParseMultipartForm(maxSize*2 + maxOverhead); err != nil {
			httpx.OkJsonCtx(r.Context(), w, &types.DataResp{
				Code:    400,
				Message: "请求数据过大",
			})
			return
		}

		name := r.FormValue("name")
		profile := r.FormValue("profile")

		_, photoFileHeader, _ := r.FormFile("photo")
		_, bgFileHeader, _ := r.FormFile("background_image")

		l := character.NewCreateCharacterLogic(r.Context(), svcCtx)
		resp, err := l.CreateCharacter(name, profile, photoFileHeader, bgFileHeader)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
