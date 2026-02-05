// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"net/http"
	"strconv"

	"aifriend/internal/logic/character"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
	"github.com/zeromicro/go-zero/rest/pathvar"
)

// 更新角色 (multipart form)
func UpdateCharacterHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// 获取路径参数
		vars := pathvar.Vars(r)
		idStr := vars["id"]
		characterId, err := strconv.ParseInt(idStr, 10, 64)
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, &types.DataResp{
				Code:    400,
				Message: "无效的角色ID",
			})
			return
		}

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

		l := character.NewUpdateCharacterLogic(r.Context(), svcCtx)
		resp, err := l.UpdateCharacter(characterId, name, profile, photoFileHeader, bgFileHeader)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
