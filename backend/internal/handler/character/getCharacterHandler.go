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

// 获取单个角色
func GetCharacterHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req types.CharacterIdReq
		if err := httpx.Parse(r, &req); err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
			return
		}

		l := character.NewGetCharacterLogic(r.Context(), svcCtx)
		resp, err := l.GetCharacter(&req)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
