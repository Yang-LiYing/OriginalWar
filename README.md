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
<pre><code>this.makeAPair(Room.mode.single_player);</code></pre>
在GameServer.prototype.start內的這行給定的Room.mode.single_player可以指定整個伺服器開啟的房間模式，可更改成任何已經寫好初始化的模式，接下來介紹已設定的模式和在哪裡初始化模式。

- Room.js  
<pre><code>Room.mode = {
	'single_player':          {'id': 1,'number_of_player': 1},
	'two_player':             {'id': 2,'number_of_player': 2},
	'bot_and_single_player':  {'id': 3,'number_of_player': 2},
}</pre></code>
目前預設可使用的模式是single_player和two_player，根據不同模式在Room內部函數init提供各別的初始化包含玩家位置和初始狀態(Soldier數量)。

伺服器流程:
- 根據已設定的模式去計算目前已連線的閒置玩家(status:idle)
- 人數達模式的預期人數時建立新的Room並初始化
- 將伺服器已存在閒置玩家推入Room
