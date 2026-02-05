// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package character

import (
	"net/http"

	"aifriend/internal/logic/character"
	"aifriend/internal/svc"
	"github.com/zeromicro/go-zero/rest/httpx"
)

// 获取角色列表
func GetCharacterListHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		l := character.NewGetCharacterListLogic(r.Context(), svcCtx)
		resp, err := l.GetCharacterList()
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
