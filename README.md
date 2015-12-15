# OriginalWar
nodejs server,javascript game,strategy game  

開啟伺服器指令:
 - ubuntu: nodejs index.js

操作: 滑鼠 左鍵 滾輪  

遊戲方法: 
- 移動滑鼠來**移動**或**收集**soldier  
- 滑鼠左鍵**建立**barrack  
- 移動soldier**攻擊**不同顏色的敵人

模式調整:  
- server.js  
<pre><code>function GameServer(){
            this.clientConnections = 0;
	        this.clients = [];
	        this.option = {
		        serverPort:8898,
		        serverMaxConnections: 1,
	        }
	        this.teams = new Array();
    }</pre></code>
單人測試模式(serverMaxConnections: 1)和雙人對戰模式(serverMaxConnections: 2)
如果想要大於兩個人玩在不僅是修改serverMaxConnections還要在initRoom新增else if(this.option.serverMaxConnections == **option設定值** && this.clientConnections == **開始遊戲人數**)內的區塊就是初始化各個玩家的位置初始soldier數量
