package mlog

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"time"
)

type logInfo struct {
	Level      string
	Date       string
	Message    string
	Context    interface{}
	StrContext string
}

var config struct {
	Level  string
	Levels map[string]int
	Path   string
}

func init() {
	config.Level = "debug"
	config.Levels = map[string]int{"debug": 100, "info": 200, "warning": 300, "error": 400, "off": 500}
	path, _ := filepath.Abs(os.Args[0])
	config.Path = path
}

//设置日志级别（off为关闭日志
func SetLevel(level string) {
	if _, ok := config.Levels[level]; ok {
		config.Level = level
	}
}

//设置日志路径
func SetLogPrefixPath(prefixPath string) {
	config.Path = prefixPath
	mkdirLogErr := os.MkdirAll(config.Path, os.ModePerm)
	if mkdirLogErr != nil {
		panic(mkdirLogErr)
	}
}

//获取日志路径
func GetLogPrefixPath() string {
	return config.Path
}

func Debug(message string, data interface{}, stdout bool) {
	write("DEBUG", message, data, stdout)
}
func Info(message string, data interface{}, stdout bool) {
	write("INFO", message, data, stdout)
}
func Warning(message string, data interface{}, stdout bool) {
	write("WARNING", message, data, stdout)
}
func Error(message string, data interface{}, stdout bool) {
	write("ERROR", message, data, stdout)
}

func write(level string, message string, data interface{}, stdout bool) bool {
	lev := strings.ToLower(level)
	//当前记录log级别需大于设置或默认的log级别才记录
	if config.Levels[lev] < config.Levels[config.Level] {
		return false
	}
	logPrefixPath := GetLogPrefixPath()
	if logPrefixPath == "" {
		fmt.Println("日志系统暂未启动完毕", level, message, data)
		return false
	}
	fileName := filepath.Join(logPrefixPath, time.Now().Format("20060102")+".log")
	file, openFileError := os.OpenFile(fileName, os.O_CREATE|os.O_APPEND|os.O_RDWR, 0777)
	if openFileError != nil {
		fmt.Println(fileName+" 文件打开创建失败", openFileError)
		panic(openFileError)
	}
	defer file.Close()

	var formatData logInfo
	formatData.Level = level
	formatData.Date = time.Now().Format("2006-01-02 15:04:05")
	formatData.Message = message
	formatData.Context = data
	formatData.StrContext = fmt.Sprint(data)
	formatDataJsonByte, jsonError := json.Marshal(formatData)
	formatDataJsonStr := string(formatDataJsonByte)
	if jsonError != nil {
		fmt.Println("json编码失败", jsonError)
		panic(jsonError)
	}
	file.WriteString(formatDataJsonStr + "\n")
	//是否标准输出

	if stdout {
		fmt.Println(formatDataJsonStr, formatData)
	}
	return true
}
