# MJGO
A Golang web framework

***

#### 目录介绍
- Bootstrap （核心启动目录）
    + app.go
    + config.go        #核心配置文件
    + controller.go     #基类控制器
    + model.go          #基类model
- Controllers  （控制器文件目录）
    - IndexController.go
- Data  （数据存放目录，日志、备份版本等；自动生成可忽略）
    - Logs/baks
- Libs  （类库）
    - helper
        + file.go
        + http.go
        + path.go
        + time.go
    - mlog
        + index.go
- Models  （数据模型定义）
    + UserModel.go
- Router  （路由管理）
    + router.go
- static  （静态资源目录）
    - js/css
- Views  （模本文件目录）
    + index.html

#### 以上是框架基础目录

***

下载代码后运行go build main.go在当前目录生成main可执行文件双击即可运行查看。
当前代码是带webview版本如不如要在`main.go`中去除最后一行调用和导入包即可
[zserge/webview](https://github.com/zserge/webview "zserge/webview") github主页 
![App截图](http://oss-findoit-image.fire80.com/images/2019/10/17/17/5da837ffa707c.png 'App截图')


1. 编译资源注意事项

```
Bootstrap.Config.StaticCompile = true   #静态资源编译
Bootstrap.Config.ViewsCompile = true    #模板文件编译
Bootstrap.Config.ViewsCompileLayout = true     #编译模板文件是否需要默认layout，header、footer
```
- `StaticCompile | ViewsCompile`默认静态资源和模板资源需要编译运行使用go-bindata进行编译到各自根目录即可，如不需要编译运行参数设置为false即可实时解析最新文件
- `ViewsCompileLayout`默认编译模板自动使用layout头尾布局，如不需要设置为false即可
- 控制器中`view('index.html')`渲染模板的默认自动使用layout头尾布局，如不需要``view('index.html', false, false)`即可

2. go-bindata示例
```
go-bindata -pkg=Views -o Views/views.go Views/... && go-bindata -pkg=Static -o Static/static.go Static/...
```
3. 数据库
- 默认启用sqlite数据库，表定义sql可在Bootstrap/model.go `InitDatabaseTables`方法中定义，启动时注册生成；