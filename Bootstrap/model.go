package Bootstrap

import (
	"app/Libs/mlog"
	"database/sql"
	"fmt"
	_ "github.com/mattn/go-sqlite3"
	"path/filepath"
	"strings"
)

type Model struct {
	table        string
	fields       string
	where        string
	whereParams  []interface{}
	insertParams []interface{}
	setParams    []interface{}
}

var mdb *sql.DB

func init() {
	fmt.Println("model.init")
}
func (t *Model) getFields() string {
	if t.fields == "" {
		return "*"
	} else {
		return t.fields
	}
}
func (t *Model) getWhere() string {
	if t.where == "" {
		return " 1 = 1"
	} else {
		return t.where
	}
}

//获取table
func (t *Model) getTable() string {
	return t.table
}

/*
	示例一: Where(map[string]interface{}{"condition_1": "condition_1", "condition_2": "condition_2"})
	示例二: Where("condition_1 = ? AND condition_2 = ?", []interface{}{"condition_1", "condition_2"})
*/
func (t *Model) Where(args ...interface{}) *Model {
	whereStr, isWhereByStr := args[0].(string)
	whereMaps, isWhereByMap := args[0].(map[string]interface{})
	if len(args) == 1 && isWhereByMap {
		for field, val := range whereMaps {
			if t.where == "" {
				t.where = field + " = ?"
			} else {
				t.where += " AND " + field + " = ?"
			}
			t.whereParams = append(t.whereParams, val)
		}
	} else if len(args) == 2 && isWhereByStr {
		whereParams, ok := args[1].([]interface{})
		if !ok || len(whereParams) < 0 {
			mlog.Error("where参数为空", map[string]interface{}{"args": args}, true)
			panic("whereParams is empty!")
		}
		if t.where == "" {
			t.where = whereStr
		} else {
			t.where += " AND " + whereStr
		}
		t.whereParams = append(t.whereParams, whereParams...)
	} else {
		panic("where params error!")
	}
	return t
}

//设置表名
func (t *Model) Table(table string) *Model {
	t.table = table
	return t
}

//查询字段
func (t *Model) Select(fields ...interface{}) *Model {
	fieldsSlice := make([]string, 0)
	for _, v := range fields {
		if val, ok := v.(string); ok {
			fieldsSlice = append(fieldsSlice, val)
		} else if val, ok := v.([]string); ok {
			for _, vv := range val {
				fieldsSlice = append(fieldsSlice, vv)
			}
		}
	}
	if t.fields == "" {
		t.fields = "`" + strings.Join(fieldsSlice, "`,`") + "`"
	} else {
		t.fields += "," + "`" + strings.Join(fieldsSlice, "`,`") + "`"
	}
	return t
}

//获取多条数据
func (t *Model) GetAll() []map[string]interface{} {
	sqlStr := "SELECT " + t.getFields() + " FROM " + t.table + " WHERE " + t.getWhere()
	mlog.Debug("sqlLog", map[string]interface{}{"sql": sqlStr, "params": t.whereParams}, true)
	rows, err := mdb.Query(sqlStr, t.whereParams...)
	if err != nil {
		mlog.Error("sqlQueryError", err, true)
		panic(err)
	}
	columns, _ := rows.Columns()
	//解析容器
	row := make([]interface{}, len(columns))
	for k, _ := range columns {
		row[k] = new(sql.RawBytes)
	}
	//结果存放
	var result = make([]map[string]interface{}, 0)
	for rows.Next() {
		rows.Scan(row...)
		var rowMap = make(map[string]interface{}, len(columns))
		for k, v := range columns {
			val, _ := row[k].(*sql.RawBytes)
			rowMap[v] = string(*val)
		}
		result = append(result, rowMap)
	}
	return result
}

//获取多条数据（GetAll别名）
func (t *Model) Gets() []map[string]interface{} {
	return t.GetAll()
}

//获取一条数据
func (t *Model) GetOne() map[string]interface{} {
	sqlStr := "SELECT " + t.getFields() + " FROM " + t.table + " WHERE " + t.getWhere() + " LIMIT 1"
	mlog.Debug("sqlLog", map[string]interface{}{"sql": sqlStr, "params": t.whereParams}, true)
	rows, err := mdb.Query(sqlStr, t.whereParams...)
	if err != nil {
		mlog.Error("sqlQueryError", err, true)
		panic(err)
	}
	columns, _ := rows.Columns()
	//解析容器
	row := make([]interface{}, len(columns))
	for k, _ := range columns {
		row[k] = new(sql.RawBytes)
	}
	//结果存放
	var result = make(map[string]interface{}, 0)
	for rows.Next() {
		rows.Scan(row...)
		for k, v := range columns {
			val, _ := row[k].(*sql.RawBytes)
			result[v] = string(*val)
		}
	}
	return result
}

//获取一条数据（GetOne别名）
func (t *Model) First() map[string]interface{} {
	return t.GetOne()
}

//插入一条数据
func (t *Model) Insert(data interface{}) int64 {
	values := make([]map[string]interface{}, 0)
	if mapValue, ok := data.([]map[string]interface{}); ok {
		values = mapValue
	} else if value, ok := data.(map[string]interface{}); ok {
		values = append(values, value)
	} else {
		mlog.Error("参数错误（参数类型为[]map[string]interface{}或者map[string]interface{}）", data, true)
	}
	sqlFieldsStr := ""
	sqlValuesStr := " VALUES "
	for _, value := range values {
		sqlValuesStr += "("
		var tmpSqlFieldsStr = ""
		for field, val := range value {
			tmpSqlFieldsStr += field + ","
			sqlValuesStr += "?,"
			t.insertParams = append(t.insertParams, val)
		}
		sqlValuesStr = strings.TrimRight(sqlValuesStr, ",") + "),"
		if sqlFieldsStr == "" {
			sqlFieldsStr = "(" + strings.TrimRight(tmpSqlFieldsStr, ",") + ")"
		}
	}
	sqlStr := "INSERT INTO " + t.getTable() + sqlFieldsStr + strings.TrimRight(sqlValuesStr, ",")
	mlog.Debug("sqlLog", map[string]interface{}{"sql": sqlStr, "data": data}, true)
	stmt, err := mdb.Prepare(sqlStr)
	res, err := stmt.Exec(t.insertParams...)
	if err != nil {
		mlog.Error("exec执行失败", map[string]interface{}{"error": err, "data": data}, true)
		panic(err)
	}
	lastInsertID, _ := res.LastInsertId()
	return lastInsertID
}

//保存一条数据（Insert别名）
func (t *Model) Save(data interface{}) int64 {
	return t.Insert(data)
}

//修改数据
func (t *Model) Update(data map[string]interface{}) int64 {
	sets := ""
	setParams := make([]interface{}, 0)

	for field, val := range data {
		sets += field + " = ?,"
		setParams = append(setParams, val)
	}
	sets = strings.TrimRight(sets, ",")
	sqlStr := "UPDATE " + t.getTable() + " SET " + sets + " WHERE " + t.getWhere()
	executeParams := append(setParams, t.whereParams...)
	mlog.Debug("sqlLog", map[string]interface{}{"sql": sqlStr, "data": data, "executeParams": executeParams}, true)
	stmt, err := mdb.Prepare(sqlStr)
	res, err := stmt.Exec(executeParams...)
	if err != nil {
		mlog.Error("exec执行失败", map[string]interface{}{"error": err, "sql": sqlStr, "data": data, "executeParams": executeParams}, true)
		panic(err)
	}
	rowsAffected, _ := res.RowsAffected()
	return rowsAffected
}

//修改数据（Update别名）
func (t *Model) Modify(data map[string]interface{}) int64 {
	return t.Update(data)
}

//自定义执行sql
func (t *Model) Query(sql string, args ...interface{}) int64 {
	mlog.Debug("sqlLog", map[string]interface{}{"sql": sql, "args": args}, true)
	res, err := mdb.Exec(sql, args...)
	if err != nil {
		mlog.Error("exec执行失败", map[string]interface{}{"sql": sql, "args": args}, true)
		panic(err)
	}
	rowsAffected, _ := res.RowsAffected()
	return rowsAffected
}

//初始化数据库
func InitDatabase(path string) bool {
	mlog.Debug("初始化数据库开始", "", true)
	if mdb != nil {
		return true
	}
	db, err := sql.Open("sqlite3", filepath.Join(path, "my.db"))
	if err != nil {
		mlog.Debug("初始化数据库失败", err, true)
		panic(err)
	}
	mdb = db
	mlog.Debug("初始化数据库结束", "", true)
	InitDatabaseTables()
	return true
}

//初始化数据表
func InitDatabaseTables() bool {
	mlog.Debug("初始化数据表开始", "", true)
	tables := []map[string]string{
		{"table": "Users", "command": "CREATE TABLE IF NOT EXISTS Users (id integer primary key autoincrement, name varchar(50) not null, phone char(11) not null, password varchar(50) default '' not null, created_at varchar(50) not null, updated_at varchar(50) not null);"},
		{"table": "Heros", "command": "CREATE TABLE IF NOT EXISTS Heros (id INTEGER primary key autoincrement, rank char(50) not null, name char(50) not null, beforeWeight char(50) not null, afterWeight char(50) not null, result char(50) not null);"},
	}
	for k, row := range tables {
		res := new(Model).Query(row["command"])
		mlog.Debug("初始化表", map[string]interface{}{"table": row["table"], "command": row["command"], "len": k, "commandRes": res}, true)
	}
	mlog.Debug("初始化数据表结束", "", true)
	return true
}
