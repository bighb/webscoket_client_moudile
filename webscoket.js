function webscokets(){
    this.wscloction = false; //防止重复连接测试pullrequest
    this.ws = '';
    this.tt;
    var that = this;
    that.echores = function(url,callback){
        try {
            that.ws = new WebSocket(url);
            that.init(url,callback);
        } catch (error) {
            that.starts(url);
        }
    }
    that.init = function(url,callback){
        var urls = url;
        var objs = callback;
        that.ws.onclose = function () {
            that.starts(url,objs);
        }
        that.ws.onerror = function(){
            that.starts(url,objs);
        }
        that.ws.onopen = function () {
            that.heartCheck.start();
            that.ws.send('INIT');
        }
        that.ws.onmessage = function(event){
            that.heartCheck.start();
            if (event.data.indexOf('{') > -1) {
                event = JSON.parse(event.data);
                objs(event);
            }
            
        };
    }
    that.heartCheck = {
        timeout: 1000,
        timeoutObj: null,
        serverTimeoutObj: null,
        start: function(){
            var self = this;
            this.timeoutObj && clearTimeout(this.timeoutObj);
            this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
            this.timeoutObj = setTimeout(function(){
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            that.ws.send("PD");
            self.serverTimeoutObj = setTimeout(function() {
                that.ws.close();
                // createWebSocket();
            }, self.timeout);

            }, this.timeout)
        }
    }
    that.starts = function(url,callback){
        if(that.lockstarts) {
            return;
        };
        that.lockstarts = true;
        //没连接上会一直重连，设置延迟避免请求过多
        that.tt && clearTimeout(that.tt);
        that.tt = setTimeout(function () {
            that.echores(url,callback);
            that.lockstarts = false;
        }, 2000);
        }
}