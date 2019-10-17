package Router

import (
	"app/Bootstrap"
	"app/Controllers"
	"app/Libs/mlog"
)

//配置加载路由
func LoadRouter() {
	mlog.Debug("Load router", "", true)
	Bootstrap.Router("/", &Controllers.IndexController{}, "Index")
	Bootstrap.Router("/index", &Controllers.IndexController{}, "Index")
	Bootstrap.Router("/index/index", &Controllers.IndexController{}, "Index")
}
