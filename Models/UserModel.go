package Models

import (
	"app/Bootstrap"
	"fmt"
)

func init() {
	fmt.Println("Models.UserModel.init")
}

var Table string = "Users"

type UserModel struct {
	Bootstrap.Model
}
