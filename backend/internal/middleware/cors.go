package middleware

import (
	"net/http"
	"strings"
)

type CorsMiddleware struct {
	AllowOrigins     []string
	AllowCredentials bool
}

func NewCorsMiddleware(allowOrigins []string, allowCredentials bool) *CorsMiddleware {
	return &CorsMiddleware{
		AllowOrigins:     allowOrigins,
		AllowCredentials: allowCredentials,
	}
}

func (m *CorsMiddleware) Handle(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")

		// 设置CORS头
		if origin != "" && m.isOriginAllowed(origin) {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			if m.AllowCredentials {
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}
		}

		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS, PATCH")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With, Accept, Origin")
		w.Header().Set("Access-Control-Max-Age", "86400")

		// 处理预检请求
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next(w, r)
	}
}

func (m *CorsMiddleware) isOriginAllowed(origin string) bool {
	for _, allowed := range m.AllowOrigins {
		if allowed == "*" {
			return true
		}
		if strings.EqualFold(allowed, origin) {
			return true
		}
	}
	return false
}
