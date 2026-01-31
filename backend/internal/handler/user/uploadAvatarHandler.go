// Code scaffolded by goctl. Safe to edit.
// goctl 1.9.2

package user

import (
	"net/http"

	"aifriend/internal/logic/user"
	"aifriend/internal/svc"
	"aifriend/internal/types"

	"github.com/zeromicro/go-zero/rest/httpx"
)

// 上传头像
func UploadAvatarHandler(svcCtx *svc.ServiceContext) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		maxSize := svcCtx.Config.Upload.MaxAvatarSize
		if maxSize <= 0 {
			maxSize = 2 * 1024 * 1024
		}

		const maxOverhead = int64(256 * 1024)
		r.Body = http.MaxBytesReader(w, r.Body, maxSize+maxOverhead)
		if err := r.ParseMultipartForm(maxSize + maxOverhead); err != nil {
			httpx.OkJsonCtx(r.Context(), w, &types.DataResp{
				Code:    400,
				Message: "头像大小不能超过2MB",
			})
			return
		}

		file, header, err := r.FormFile("avatar")
		if err != nil {
			httpx.OkJsonCtx(r.Context(), w, &types.DataResp{
				Code:    400,
				Message: "请上传头像文件",
			})
			return
		}
		file.Close()

		l := user.NewUploadAvatarLogic(r.Context(), svcCtx)
		resp, err := l.UploadAvatar(header)
		if err != nil {
			httpx.ErrorCtx(r.Context(), w, err)
		} else {
			httpx.OkJsonCtx(r.Context(), w, resp)
		}
	}
}
