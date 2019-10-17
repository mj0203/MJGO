$(function () {
    (function(){
        var main = {
            init: function(){
                this.checkUpgrade()
            },
            checkRunning: false,
            checkUpgrade: function(){
                setInterval(function () {
                    if(main.checkRunning){
                        console.log("升级中...")
                        return false;
                    }
                    let ckResult = Fd.url("/upgrade/check").post()
                    if(ckResult && typeof ckResult.data.upgrade!="undefined" && ckResult.data.upgrade==true){
                        var options = {"ok": [null, function(){
                                let result = Fd.url("/upgrade/start").post()
                                if(typeof result.data.success!="undefined" && result.data.success=="ok"){
                                    Flayer.tips("升级完毕，请重启软件", function(){
                                        Fd.url("/upgrade/stop").post()
                                        main.checkRunning = false
                                    })
                                }else{
                                    main.checkRunning = false
                                }
                                return true
                            }]}
                        //强制升级 去除取消按钮
                        if(ckResult.data.force==true){
                            options.cancel = false
                        }else{
                            options.cancel = [null, function () {
                                main.checkRunning = false;
                            }]
                        }
                        main.checkRunning = true
                        Flayer.confirm("当前为旧版本，是否确认升级?", options);
                    }else{
                        main.checkRunning = false
                    }
                }, 10000)
            },
            disableEnv: function () {
                //禁用右键
                document.oncontextmenu = function(){
                    return false
                }
                //禁用拷贝
                document.oncopy = function(){
                    return false;
                }
                //禁用选择
                document.onselectstart = function(){
                    return false;
                }
            }
        }
        main.init()
    })()
})