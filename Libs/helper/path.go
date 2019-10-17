package helper

import (
	"app/Libs/mlog"
	"path/filepath"
)

func Abs(path string) string {
	absPath, err := filepath.Abs(path)
	if err != nil {
		mlog.Error("获取路径错误", map[string]interface{}{"path": path, "error": err}, true)
		panic(err)
	}
	return absPath
}
