package helper

import (
	"fmt"
	"io/ioutil"
	"os"
)

//读取文件内容
func Read(filepath string) ([]byte, string) {
	if _, err := os.Stat(filepath); err != nil {
		fmt.Println(filepath+" not found!", err)
		panic(err)
	}
	file, openErr := os.Open(filepath)
	if openErr != nil {
		fmt.Println("打开文件失败", filepath, openErr)
		panic(openErr)
	}
	defer file.Close()
	htmlByte, readErr := ioutil.ReadAll(file)
	if readErr != nil {
		fmt.Println("读取文件失败", filepath, readErr)
		panic(readErr)
	}
	return htmlByte, string(htmlByte)
}
