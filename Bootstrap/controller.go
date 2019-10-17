package Bootstrap

import (
	"app/Libs/helper"
	"app/Libs/mlog"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

//http结构类型
type HttpResultT struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data"`
}

type Controller struct {
	CtxW http.ResponseWriter
	CtxR *http.Request

	Account map[string]interface{}
}

//获取参数
func (ctl *Controller) GetParams(key string, args ...interface{}) interface{} {
	if val := ctl.CtxR.Form[key]; len(val) > 0 {
		return val[0]
	} else if len(args) > 0 {
		return args[0]
	}
	return nil
}

//渲染编译模板
func (ctl *Controller) View(path string, layouts ...bool) {
	/* 编译渲染
	ctl.CtxR.URL.Path = strings.TrimSuffix(path, ".html") + ".html"
	IsCompileRouterViews(ctl.CtxW, ctl.CtxR)
	*/
	//开发版读取最新文件内容
	absPath, _ := filepath.Abs(os.Args[0])
	viewPrefix := filepath.Dir(absPath) + "/Views/"
	mainPath := strings.Replace(viewPrefix+path, "//", "/", -1)
	_, mainHtml := helper.Read(mainPath)

	headerPath := viewPrefix + "layout/header.html"
	footerPath := viewPrefix + "layout/footer.html"
	var headerHtml, footerHtml string
	if len(layouts) == 0 {
		_, headerHtml = helper.Read(headerPath)
		_, footerHtml = helper.Read(footerPath)
	} else if len(layouts) == 1 && layouts[0] == true {
		_, headerHtml = helper.Read(headerPath)
	} else if len(layouts) == 2 && layouts[1] == true {
		_, footerHtml = helper.Read(footerPath)
	}

	ctl.CtxW.Write([]byte(headerHtml + mainHtml + footerHtml))
}
func (ctl *Controller) ErrJson() {
	ctl.CtxW.Header().Set("Content-Type", "application/json; charset=utf-8")

	content := struct {
		Code    int         `json:"code"`
		Data    interface{} `json:"data"`
		Message string      `json:"message"`
	}{0, "", "失败"}
	result, err := json.Marshal(content)
	if err != nil {
		mlog.Error("json输出格式化失败", content, true)
		panic("json输出格式化失败")
	}
	ctl.CtxW.Write(result)
}
func (ctl *Controller) SuccJson(data interface{}) {
	ctl.CtxW.Header().Set("Content-Type", "application/json; charset=utf-8")

	content := struct {
		Code    int         `json:"code"`
		Data    interface{} `json:"data"`
		Message string      `json:"message"`
	}{200, data, "成功"}
	result, err := json.Marshal(content)
	if err != nil {
		mlog.Error("json输出格式化失败", content, true)
		panic("json输出格式化失败")
	}
	ctl.CtxW.Write(result)
}

//http请求
func (ctl *Controller) Http(path string, method string, params interface{}, data interface{}) HttpResultT {
	var result HttpResultT
	resStr := helper.Http(path, method, params)
	if resStr != "" {
		err := json.Unmarshal([]byte(resStr), &result)
		if err != nil {
			mlog.Error("解析json出错", result, true)
			panic(err)
		}
		dataByte, err := json.Marshal(result.Data)
		if err != nil {
			mlog.Error("编码json出错", result, true)
			panic(err)
		}
		json.Unmarshal([]byte(dataByte), data)
		result.Data = data
	}
	return result
}
