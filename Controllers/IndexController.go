package Controllers

import (
	"app/Bootstrap"
	"fmt"
)

type IndexController struct {
	Bootstrap.Controller
}

func (ctl *IndexController) Index() {
	fmt.Println("index.index")

	ctl.View("index/index.html")
}
