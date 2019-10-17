package helper

import (
	"app/Libs/mlog"
	"encoding/json"
	"io/ioutil"
	"net/http"
	"strings"
)

/*
	http请求
	Http("http://yourDomain/urlpath", "GET|POST", map[string]interface{})
*/
func Http(path string, args ...interface{}) string {
	mlog.Debug("http开始", map[string]interface{}{"path": path, "args": args}, true)
	method := "GET"
	paramStr := ""
	//Method 请求方法
	if len(args) >= 1 {
		method = strings.ToUpper(args[0].(string))
	}
	//Params 请求参数
	if len(args) >= 2 {
		byteJson, err := json.Marshal(args[1])
		if err != nil {
			mlog.Error("http参数解析错误", err, true)
			panic(err)
		}
		paramStr = string(byteJson)
	}
	client := &http.Client{}
	req, err := http.NewRequest(method, path, strings.NewReader(paramStr))
	if err != nil {
		mlog.Error("http.NewRequest错误", err, true)
		panic(err)
	}
	req.Header.Set("Content-Type", "application/json")
	resp, err := client.Do(req)
	defer resp.Body.Close()

	bytesBody, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		mlog.Error("http读取body内容错误", err, true)
		panic(err)
	}
	mlog.Debug("http结束", map[string]interface{}{"path": path, "args": args, "result": string(bytesBody)}, true)
	return string(bytesBody)
}
