package character

import (
	"context"
	"encoding/json"
	"errors"
	"strconv"
)

func userIdFromContext(ctx context.Context) (int64, error) {
	value := ctx.Value("user_id")
	if value == nil {
		value = ctx.Value("userId")
	}

	switch v := value.(type) {
	case json.Number:
		return v.Int64()
	case float64:
		return int64(v), nil
	case float32:
		return int64(v), nil
	case int64:
		return v, nil
	case int:
		return int64(v), nil
	case int32:
		return int64(v), nil
	case uint64:
		return int64(v), nil
	case uint:
		return int64(v), nil
	case string:
		return strconv.ParseInt(v, 10, 64)
	default:
		return 0, errors.New("无效的用户身份")
	}
}
