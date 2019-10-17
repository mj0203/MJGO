package Bootstrap

import (
	"app/Libs/mlog"
	"app/Static"
	"app/Views"
	"net/http"
	"reflect"
	"strings"
)

type route struct {
	Path       string
	Controller interface{}
	Action     string
}

var routes map[string]route

func Router(path string, ctl interface{}, action string) {
	if routes == nil {
		routes = map[string]route{}
	}
	if _, ok := routes[path]; ok {
		mlog.Warning("path已存在", routes[path], true)
		panic("path is exist!")
	}
	routes[path] = route{path, ctl, action}
}

//启动核心
func Run() {
	http.HandleFunc("/favicon.ico", func(writer http.ResponseWriter, request *http.Request) {
		writer.Write([]byte(""))
	})

	IsStartStaticServer()

	http.HandleFunc("/", func(writer http.ResponseWriter, request *http.Request) {
		if IsCompileRouterViews(writer, request) {
			mlog.Debug("编译模板资源服务处理", request.URL.Path, true)
		} else if IsCompileRouterStatic(writer, request) {
			mlog.Debug("编译静态资源服务处理", request.URL.Path, true)
		} else {
			request.ParseForm()
			logData := map[string]interface{}{"method": request.Method, "urlPath": request.URL.Path, "refer": request.Referer(), "userAgent": request.UserAgent()}
			mlog.Debug("动态路由入口:", logData, true)
			if sroute, ok := routes[request.URL.Path]; ok {
				Tctlval := reflect.ValueOf(sroute.Controller)
				ckCtlMethod := Tctlval.MethodByName(sroute.Action)
				//ctl检测方法存在
				if ckCtlMethod.IsValid() {
					Tctlval.Elem().FieldByName("CtxW").Set(reflect.ValueOf(writer))
					Tctlval.Elem().FieldByName("CtxR").Set(reflect.ValueOf(request))
					ckCtlMethod.Call(make([]reflect.Value, 0))
				} else {
					mlog.Error("控制器方法未找到", sroute, true)
					panic("控制器方法[ " + sroute.Action + " ]未找到")
				}
			} else {
				mlog.Error("未定义路由，需要另行处理...", "", true)
				panic("未定义路由，需要另行处理...")
			}
		}
	})
	http.ListenAndServe(Config.HttpListenPort, nil)
}

//启动经过编译处理静态资源Static
func IsCompileRouterStatic(writer http.ResponseWriter, request *http.Request) bool {
	//配置静态编译
	if Config.StaticCompile {
		isJs := strings.HasSuffix(request.URL.Path, ".js")
		isCss := strings.HasSuffix(request.URL.Path, ".css")
		isPng := strings.HasSuffix(request.URL.Path, ".png")
		isJpg := strings.HasSuffix(request.URL.Path, ".jpg")
		if isJs || isCss || isPng || isJpg {
			staticBytes, err := Static.Asset(strings.TrimPrefix(request.URL.Path, "/"))
			if err != nil {
				mlog.Error("读取编译静态资源错误", err, true)
				panic(err)
			}
			if isJs {
				writer.Header().Set("Content-Type", "application/x-javascript; charset=utf-8")
			} else if isCss {
				writer.Header().Set("Content-Type", "text/css")
			}
			writer.Write(staticBytes)
			return true
		}
	}
	return false
}

//是否经过编译处理模板资源Views
func IsCompileRouterViews(writer http.ResponseWriter, request *http.Request) bool {
	//配置模板编译
	if Config.ViewsCompile {
		isHtml := strings.HasSuffix(request.URL.Path, ".html")
		if isHtml {
			var headerBytes, footerBytes []byte
			if Config.ViewsCompileLayout == true {
				headerBytes, _ = Views.Asset("Views/layout/header.html")
				footerBytes, _ = Views.Asset("Views/layout/footer.html")
			}
			mainBytes, err := Views.Asset(strings.Replace("Views/"+request.URL.Path, "//", "/", -1))
			if err != nil {
				mlog.Error("读取编译模板资源错误", err, true)
				panic(err)
			}
			html := string(headerBytes) + string(mainBytes) + string(footerBytes)
			writer.Header().Set("Content-Type", "text/html; charset=utf-8")
			writer.Write([]byte(html))
			return true
		}
	}
	return false
}

//检测开启静态资源服务器
func IsStartStaticServer() {
	//未开启压缩静态资源方式
	if !Config.StaticCompile {
		mlog.Info("未开启静态资源压缩方式", "", true)
		http.Handle("/Static/", http.StripPrefix("/Static/", http.FileServer(http.Dir(GetStaticPrefixPath()))))
		mlog.Info("已启动静态web资源服务器", "", true)
	}
}
