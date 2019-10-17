package helper

import "time"

var DateLayout struct {
	Year    string
	Month   string
	Day     string
	Hour    string
	Minute  string
	Second  string
	Full    string
	DateSep string
	TimeSep string
}

func init() {
	DateLayout.DateSep = "-"
	DateLayout.TimeSep = ":"
	DateLayout.Year = "2006"
	DateLayout.Month = "01"
	DateLayout.Day = "02"
	DateLayout.Hour = "15"
	DateLayout.Minute = "04"
	DateLayout.Second = "05"
	DateLayout.Full = DateLayout.Year + DateLayout.DateSep + DateLayout.Month + DateLayout.DateSep + DateLayout.Day
	DateLayout.Full += " " + DateLayout.Hour + DateLayout.TimeSep + DateLayout.Minute + DateLayout.TimeSep + DateLayout.Second
}

//时间戳转换日期格式
func TimeToDate(timestamp int64) string {
	timer := time.Unix(timestamp, 0)
	return timer.Format(DateLayout.Full)
}

//日期格式转换时间戳
func DateToTime(dateStr string) int64 {
	//timer, _ := time.Parse(DateLayout.Full, dateStr) //多8小时
	timer, _ := time.ParseInLocation(DateLayout.Full, dateStr, time.Local)
	return timer.Unix()
}

//获取当前时间戳
func CurrentTime() int64 {
	return time.Now().Unix()
}

//获取当前时间格式
func CurrentDate() string {
	return TimeToDate(time.Now().Unix())
}
