window.onload=function(){
	//获取元素属性的方法
	function getStyle(ele,attr){
		var res=null;
		if(ele.currentStyle){
			res=ele.currentStyle[attr];
		}else {
			res=window.getComputedStyle(ele,null)[attr];
		}
		return parseFloat(res);
	}
	// 获取元素
	var game=document.getElementById("game");
	var gameStart=document.getElementById("gameStart");
	var start=gameStart.getElementsByTagName("span")[0];
	var gameEnter=document.getElementById("gameEnter");
	var myPlane=document.getElementById("myPlane");
	var bulletsP=document.getElementById("bullets");
	var enemysP=document.getElementById("enemys");
	var score=document.getElementById("scores").firstElementChild.firstElementChild;

	
	//获取需要用到的元素的样式
	var gameW=getStyle(game,"width");
	var gameH=getStyle(game,"height");
    var gameML=getStyle(game,"marginLeft");
	var gameMT=getStyle(game,"marginTop");
	var myPlaneW=getStyle(myPlane,"width");
	var myPlaneH=getStyle(myPlane,"height");
	//子弹的宽高
	var bulletW=6;
	var bulletH=14;
	//声明要使用的全局变量
	var gameStatus=false;//游戏状态设定
	var timer=null;//创建子弹的定时器
	var timer1=null;//创建敌机的定时器
	var timer2=null;//背景图片运动的定时器
	var backgroundY=0;//背景图Y轴上的值
	var bullets=[];
	var enemys=[];
	var scores=0;

	//进入游戏
	start.onclick=function(){
		gameStart.style.display="none";
		gameEnter.style.display="block";
		document.onkeyup=function(evt){
			var e=evt||window.event;
			var keyVal=e.keyCode;
			if(keyVal==32){
				if(!gameStatus){
					//初始化得分
					//scores=0;
					//开始游戏	
					this.onmousemove=myPlaneMove;
					//背景图运动
					bgMove();
					//子弹射击
					shot();
					//出现敌机
					appearEnemy();
					//暂停后重启
					if(bullets.length!=0){restart(bullets,timer);};

					if(enemys.length!=0){restart(enemys);};

				}else{
					//暂停游戏
					//清除己方飞机的运动
					this.onmousemove=null;
					//清除创建子弹和敌机的定时器，以及背景图运动的定时器
					clearInterval(timer);
					clearInterval(timer1);
					clearInterval(timer2);

					timer=null;
					timer1=null;
					timer2=null;
					//清除子弹和敌机运动定时器
					clear(enemys);
					clear(bullets);

				}
				gameStatus=!gameStatus;
				
			}
			
		}
	}
	function myPlaneMove(evt){
		var e=evt||window.event;
		//获取鼠标位置
	    //var scrollX = document.documentElement.scrollLeft || document.body.scrollLeft;
        //var scrollY = document.documentElement.scrollTop || document.body.scrollTop;
		var mouse_x=e.clientX||e.pageX;
	    var mouse_y=e.clientY||e.pageY;
		
		//计算鼠标移动时己方飞机的左上边距
		var myPlane_left=mouse_x-gameML-myPlaneW/2;
		var myPlane_top=mouse_y-gameMT-myPlaneH/2;
		if(myPlane_left<=0){
			myPlane_left=0;
		}else if(myPlane_left>=gameW-myPlaneW){
			myPlane_left=gameW-myPlaneW;
		}
		if(myPlane_top<=0){
			myPlane_top=0;
		}else if(myPlane_top>=gameH-myPlaneH){
			myPlane_top=gameH-myPlaneH;
		}
		myPlane.style.left = myPlane_left+"px";
		myPlane.style.top = myPlane_top+"px";
	}
	//创建子弹的定时器
	function shot(){
		if(timer)return;
		timer=setInterval(function(){
			//创建子弹
			createBullet();
			//console.log(bullets);
		},100);
	}
	//创建子弹
	function createBullet(){
		var bullet =new Image();
		bullet.src="./image/bullet1.png";
		bullet.className="b";
		//确定己方飞机位置
		var myPlaneL=getStyle(myPlane,"left");
		var myPlaneT=getStyle(myPlane,"top");
		//确定子弹位置
		var bulletL=myPlaneL+myPlaneW/2-bulletW/2;
		var bulletT=myPlaneT-bulletH;
		bullet.style.left=bulletL+'px';
		bullet.style.top=bulletT+'px';
		bulletsP.appendChild(bullet);
		bullets.push(bullet);
		move(bullet,"top");
	}
	//子弹运动及消失
	function move(ele,attr){
		var speed=-7;
		ele.timer =setInterval(function(){
			var moveVal=getStyle(ele,attr);
			if(moveVal<=-bulletH){
				clearInterval(ele.timer);
				ele.parentNode.removeChild(ele);
				bullets.shift();
			}else{
				ele.style[attr]=moveVal+speed+"px";
			}
		},10)
	}
	//创建敌机数据对象
	var enemysObj={
		enemy1:{
			width:34,
			height:24,
			score:100,
			hp:100
		},
		enemy2:{
			width:46,
			height:60,
			score:500,
			hp:500
		},
		enemy3:{
			width:110,
			height:164,
			score:1000,
			hp:1000
		},
	}
	//创建敌机的定时器
	function appearEnemy(){
		if(timer1)return;
		timer1=setInterval(function(){
			//制造敌机
			createEnemy();
			//删除死亡敌机
			delEnemy();

		},1000);
		
	}
	//创建敌机
	function createEnemy(){
		//敌机出现概率的数据
		var percentData=[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,2,2,2,2,3];
		//敌机的类型
		var enemyType=percentData[Math.floor(Math.random()*percentData.length)];
		//当前随机的敌机的数据
		var enemyData=enemysObj["enemy"+enemyType];
		//创建敌机所在的元素
		var enemy=new Image(enemyData.width,enemyData.height);
		enemy.type=enemyType;
		enemy.src="./image/enemy"+enemyType+".png";
		enemy.score=enemyData.score;
		enemy.hp=enemyData.hp;
		enemy.className="e";
		enemy.dead=false;//设定初始标签，代表敌机还活着
		var enemyL=Math.floor(Math.random()*(gameW-enemyData.width+1));
		var enemyT=-enemyData.height;
		enemy.style.left=enemyL+"px";
		enemy.style.top=enemyT+"px";
		enemysP.appendChild(enemy);
		enemys.push(enemy);
		enemyMove(enemy,"top");

	}
	
	//敌机运动消失
	function enemyMove(ele,attr){
		var speed=null;
		if(ele.type==1){
			speed=1;
		}else if(ele.type==2){
			speed=0.7;
		}else{
			speed=0.5;
		}
		ele.timer=setInterval(function(){
			moveVal=getStyle(ele,attr)
			if(moveVal>=gameH){
				clearInterval(ele.timer);
				enemysP.removeChild(ele);
				enemys.shift();
			}else{
				ele.style[attr]=moveVal+speed+"px";
				//检测每架敌机运动时与子弹的碰撞
				danger(ele);
				gameOver();
			}
		},10);

	}
	//清除子弹和敌机运动定时器
	function clear(childs){
		for(var i=0;i<childs.length;i++){
			clearInterval(childs[i].timer);
		}
	}
	//暂停后重新启动游戏
	function restart(childs,type){
		for(var i=0;i<childs.length;i++){
			type==timer?move(childs[i],"top"):enemyMove(childs[i],"top");
		}
	}

	//开始游戏之后背景图的运动
	function bgMove(){
		timer2=setInterval(function(){
			backgroundY+=0.5;
			if(backgroundY>=gameH){
				backgroundY=0;
			}else{
				gameEnter.style.backgroundPositionY=backgroundY+"px";
			}

		},10)
	}
	function danger(enemy){
		for(var i=0;i<bullets.length;i++){
			//子弹的左上边距
			var bulletL=getStyle(bullets[i],"left");
			var bulletT=getStyle(bullets[i],"top");
			//敌机的左上边距
			var enemyL=getStyle(enemy,"left");
			var enemyT=getStyle(enemy,"top");
			//敌机的宽高
			var enemyW=getStyle(enemy,"width");
			var enemyH=getStyle(enemy,"height");
			if(bulletL+bulletW>=enemyL&&bulletL<=enemyL+enemyW&&bulletT>=(enemyT-bulletH)&&bulletT<=(enemyT+enemyH)){
				//碰撞发生
				//1.先清除碰撞子弹的定时器
				clearInterval(bullets[i].timer);
				//2.删除元素
				bulletsP.removeChild(bullets[i]);
				//3.从数组中删除元素
				bullets.splice(i,1);
				//4.子弹和敌机碰撞时，敌机血量减少，为0时敌机消失
				enemy.hp-=100;
				if(enemy.hp==0){
				//1.先清除敌机的定时器
				clearInterval(enemy.timer);
				//2.删除元素
				//enemysP.removeChild(enemy);
				//3.从数组中删除元素
				//enemys.splice(i,1);
				//替换爆炸图片
				enemy.src="./image/bz"+enemy.type+".gif";
				//标记死亡敌机
				enemy.dead=true;
				scores+=enemy.score;
				score.innerHTML=scores;

				}
			}


		}
	}
	//删除敌机
	function delEnemy(){
		for(var i=0;i<enemys.length;i++){
			if(enemys[i].dead){
				(function(index){
					enemysP.removeChild(enemys[index]);
					enemys.splice(index,1);
				})(i)
			}
		}
	}
	//己方飞机和敌机碰撞，游戏结束
	function gameOver(){
		for(var i=0;i<enemys.length;i++){
			if(!enemys[i].dead){
				//敌机的左上边距
			    var enemyL=getStyle(enemys[i],"left");
				var enemyT=getStyle(enemys[i],"top");
				//敌机的宽高
				var enemyW=getStyle(enemys[i],"width");
				var enemyH=getStyle(enemys[i],"height");
				//我方飞机的左上边距
				var myPlaneL=getStyle(myPlane,"left");
				var myPlaneT=getStyle(myPlane,"top");

				if(myPlaneL+myPlaneW>=enemyL&&myPlaneL<=enemyL+enemyW&&myPlaneT>=(enemyT-myPlaneH)&&myPlaneT<=(enemyT+enemyH)){
					//gameEnter.removeChild(myPlane);
					//console.log("a");
					//清除定时器
					clearInterval(timer);
					clearInterval(timer1);
					clearInterval(timer2);
					timer=null;
					timer1=null;
					timer2=null;
					
					//删除子弹和敌机元素
					remove(bullets);
					remove(enemys);
					//清空数组
					bullets=[];
					enemys=[];
					document.onmousemove=null;
					alert("game over:"+scores+"分")
					gameStart.style.display="block";
					gameEnter.style.display="none";
					myPlane.style.left="127px";
					myPlane.style.top=gameH-myPlaneH+"px";
					score.innerHTML=0;
					
				}
					
			}
		}

	}
	//删除元素
	function remove(childs){
		for(var i=0;i<childs.length;i++){
			clearInterval(childs[i]);
			childs[i].parentNode.removeChild(childs[i]);
		}


	}


}