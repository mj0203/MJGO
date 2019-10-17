package Bootstrap

import (
	"os"
	"path/filepath"
	"runtime"
)

var Config struct {
	RootPath           string `json:"系统根路径"`
	SystemTitle        string `comment:"系统左上角显示的名称"`
	ProcID             int    `comment:"进程ID"`
	SystemName         string `comment:"系统名称"`
	HttpSuccessCode    int    `comment:"http请求成功code码"`
	ForceUpgrade       bool   `comment:"是否强制升级"`
	Version            int    `comment:"当前版本号"`
	HttpListenPort     string `comment:"http服务监听端口"`
	StaticCompile      bool   `comment:"静态资源是否编译"`
	ViewsCompile       bool   `comment:"模板文件是否编译"`
	ViewsCompileLayout bool   `comment:"编译模板是否需要layout布局"`
	ViewPrefixPath     string `comment:"模板路径"`
	StaticPrefixPath   string `comment:"静态资源路径"`
}

func init() {
	curPath, _ := filepath.Abs(os.Args[0])
	Config.RootPath = filepath.Dir(curPath)
	Config.SystemTitle = "system title"
	Config.ProcID = os.Getpid()
	Config.SystemName = runtime.GOOS
	Config.HttpSuccessCode = 10000
	Config.ForceUpgrade = false
	Config.Version = 0
	Config.HttpListenPort = ":4000"
	Config.ViewsCompile = true
	Config.ViewsCompileLayout = true
	Config.StaticCompile = true
}

//设置views路径前缀
func SetViewPrefixPath(prefixPath string) {
	Config.ViewPrefixPath = prefixPath
}

//获取views路径前缀
func GetViewPrefixPath() string {
	return Config.ViewPrefixPath
}

//设置static路径前缀
func SetStaticPrefixPath(prefixPath string) {
	Config.StaticPrefixPath = prefixPath
}

//获取static路径前缀
func GetStaticPrefixPath() string {
	return Config.StaticPrefixPath
}
