module.exports = () => {
    this.wscloction = false; //防止重复连接
    this.ws = '';
    this.tt;
    var that = this;
    that.echores = (url,callback) => {
        try {
            that.ws = new WebSocket(url);
            that.init(url,callback);
        } catch (error) {
            that.starts(url);
        }
    }
    that.init = (url,callback) => {
        var urls = url;
        var objs = callback;
        that.ws.onclose =  () => {
            that.starts(url,objs);
        }
        that.ws.onerror = () => {
            that.starts(url,objs);
        }
        that.ws.onopen =  () => {
            that.heartCheck.start();
            that.ws.send('INIT');
        }
        that.ws.onmessage = event => {
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
        start: () => {
            var self = this;
            this.timeoutObj && clearTimeout(this.timeoutObj);
            this.serverTimeoutObj && clearTimeout(this.serverTimeoutObj);
            this.timeoutObj = setTimeout(function(){
            //这里发送一个心跳，后端收到后，返回一个心跳消息，
            that.ws.send("PD");
            self.serverTimeoutObj = setTimeout(() => {
                that.ws.close();
                // createWebSocket();
            }, self.timeout);

            }, this.timeout)
        }
    }
    that.starts = (url,callback) => {
        if(that.lockstarts) {
            return;
        };
        that.lockstarts = true;
        //没连接上会一直重连，设置延迟避免请求过多
        that.tt && clearTimeout(that.tt);
        that.tt = setTimeout( () => {
            that.echores(url,callback);
            that.lockstarts = false;
        }, 2000);
        }
}