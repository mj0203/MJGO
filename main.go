package main

import (
	"app/Bootstrap"
	"app/Libs/mlog"
	"app/Router"
	"fmt"
	"github.com/zserge/webview"
	"log"
	"os"
	"path/filepath"
	"time"
)

var logger *log.Logger

func main() {
	//设置系统title
	Bootstrap.Config.SystemTitle = "MJGO"
	curPath, _ := filepath.Abs(os.Args[0])
	rootPath := filepath.Dir(curPath)
	//配置日志
	mlog.SetLogPrefixPath(filepath.Join(rootPath, "Data", "Logs"))
	//设置日志级别
	mlog.SetLevel("debug")
	fmt.Println("日志路径:", mlog.GetLogPrefixPath())

	//设置模板Views路径
	Bootstrap.SetViewPrefixPath(filepath.Join(rootPath, "Views"))
	fmt.Println("模板路径:", Bootstrap.GetViewPrefixPath())

	//禁用编译模板layout布局(直接访问html文件不需要默认layout布局的话使用此项禁用即可
	//Bootstrap.Config.ViewsCompileLayout = false

	//设置静态Static资源路径
	Bootstrap.SetStaticPrefixPath(filepath.Join(rootPath, "Static"))
	fmt.Println("静态路径:", Bootstrap.GetViewPrefixPath())

	//初始化数据库sqlite
	Bootstrap.InitDatabase(filepath.Join(rootPath, "Data"))

	//路由
	Router.LoadRouter()

	//启动服务器
	go Bootstrap.Run()

	time.Sleep(1e9)

	//启动webview(不需要app版可禁用此行)
	webview.Open(Bootstrap.Config.SystemTitle,"http://localhost:4000/index/index.html", 800, 600, true)
}
