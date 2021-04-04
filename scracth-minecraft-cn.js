class zjcTurtle {
    constructor() {
        this.block = "1";
        this.nib = [[0,0,0]];
        this.pos = [0,0,0];
        this.penDown = true;
        this.matrix = null;
        this.TO_RADIANS = Math.PI / 180;
    }
    
    clone() {
        var t = new zjcTurtle();
        t.block = this.block;
        t.nib = this.nib;
        t.pos = this.pos;
        t.penDown = this.penDown;
        t.matrix = this.matrix;
        return t;
    }
    
    mmMultiply(a,b) {
        var c = [[0,0,0],[0,0,0],[0,0,0]];
        for (var i = 0; i < 3 ; i++) for (var j = 0; j < 3 ; j++)
          c[i][j] = a[i][0]*b[0][j] + a[i][1]*b[1][j] + a[i][2]*b[2][j];
        return c;
    };
    
    mod(n,m) {
        return ((n%m)+m)%m;
    };
    
    cosDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [1,0,-1,0][this.mod(angle,360)/90];
        }
        else {
            return Math.cos(angle * this.TO_RADIANS);
        }
    }
    
    sinDegrees(angle) {
        if (this.mod(angle,90) == 0) {
            return [0,1,0,-1][this.mod(angle,360)/90];
        }
        else {
            return Math.sin(angle * this.TO_RADIANS);
        }
    }
    
    yawMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, 0, -s],
                [0, 1, 0],
                [s, 0, c]];
    };
    
    rollMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[c, -s, 0],
                [s,  c, 0],
                [0,  0, 1]];
    };
    
    pitchMatrix(angle) {
        var c = this.cosDegrees(angle);
        var s = this.sinDegrees(angle);
        return [[1, 0, 0],
                [0, c, s],
                [0,-s, c]];
    };
}

class RaspberryJamMod {
    constructor(runtime) {
        this.clear();
    }
    
    clear() {
        this.socket = null;
        this.hits = [];
        this.turtle = new zjcTurtle();
        this.turtleHistory = [];
        this.savedBlocks = null;
    }
    
    getInfo() {
        return {
            "id": "RaspberryJamMod",
            "name": "我的世界Minecraft",
             color1: '#1ab4ff',
             color2: '#2900f6',
             blockIconURI: 'data:image/png;base64,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',
            

         
            "blocks": [{
                    "opcode": "connect_p",
                    "blockType": "command",
                    "text": "连接《我的世界Minecraft》 [ip]",
                    "arguments": {
                        "ip": {
                            "type": "string",
                            "defaultValue": "localhost"
                        },
                    }
            },
                   
            {
                    "opcode": "getPlayerX",
                    "blockType": "reporter",
                    "text": "获取玩家 x[mode] 位置",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerY",
                    "blockType": "reporter",
                    "text": "获取玩家 y [mode] 位置",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },            
            {
                    "opcode": "getPlayerZ",
                    "blockType": "reporter",
                    "text": "获取玩家 z [mode] 位置",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "getPlayerVector",
                    "blockType": "reporter",
                    "text": "获取玩家[mode] 位置向量",
                    "arguments": {
                        "mode": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "modeMenu"
                        },
                    }
            },
            {
                    "opcode": "setPlayerPos",
                    "blockType": "command",
                    "text": "设置玩家位置为 ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
           {
                    "opcode": "getHeight",
                    "blockType": "reporter",
                    "text": "获取 ([x],[z])的最高方块高度",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                         "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },    
            {
                    "opcode": "movePlayerTop",
                    "blockType": "command",
                    "text": "将玩家移动到当前位置最大高度处",
                    "arguments": {
                    }
            },    
            {
                    "opcode": "chat",
                    "blockType": "command",
                    "text": "在聊天区显示 [msg]",
                    "arguments": {
                        "msg": {
                            "type": "string",
                            "defaultValue": "你好，我的世界！"
                        },
                    }
            },  
  {
                    "opcode": "setBlock",
                    "blockType": "command",
                    "text": "放置方块 [b] 在 ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "b": {
                            "type": "string",
                            "defaultValue": "41,0",
                            "menu": "blockMenu"
                        },
                    }
            },           
      {
                    "opcode": "setBlocks",
                    "blockType": "command",
                    "text": "放置批量方块 [b] 在 ([x1],[y1],[z1],[x2],[y2],[z2])",
                    "arguments": {
                        "x1": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y1": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z1": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "x2": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y2": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z2": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "b": {
                            "type": "string",
                            "defaultValue": "45,0",
                            "menu": "blockMenu"
                        },
                    }
            },     
            {
                    "opcode": "spawnEntity1",
                    "blockType": "command",
                    "text": "放养生物 [entity] 在 ([x],[y],[z])",
                    "arguments": {
                        "entity": {
                            "type": "string",
                            "defaultValue": "Sheep",
                            "menu": "entityMenu"
                        },
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },   
            {
                    "opcode": "spawnEntity2",
                    "blockType": "command",
                    "text": "放置物品 [entity] 在 ([x],[y],[z])",
                    "arguments": {
                        "entity": {
                            "type": "string",
                            "defaultValue": "MinecartRideable",
                            "menu": "entityMenu2"
                        },
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },         
            {
                    "opcode": "blockByName",
                    "blockType": "reporter",
                    "text": "[name]方块类型",
                    "arguments": {
                        "name": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
            {
                    "opcode": "getBlock",
                    "blockType": "reporter",
                    "text": "获取位置 ([x],[y],[z])的方块类型",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },    

            {
                    "opcode": "getHit",
                    "blockType": "reporter",
                    "text": "获取击剑目标位置向量",
                    "arguments": {
                    }
            },            
            {
                    "opcode": "extractFromVector",
                    "blockType": "reporter",
                    "text": "[coordinate]-坐标值 向量 [vector]",
                    "arguments": {
                        "coordinate": {
                            "type": "number",
                            "defaultValue": 0,
                            "menu": "coordinateMenu"
                        },
                        "vector": {
                            "type": "string",
                            "defaultValue": "0,0,0",
                        },
                    }
            },          
            {
                    "opcode": "makeVector",
                    "blockType": "reporter",
                    "text": "向量 ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0,
                        },
                    }
            },                
          
            {
                    "opcode": "turtleBlock",
                    "blockType": "command",
                    "text": "海龟画笔方块类型 [b]",
                    "arguments": {
                        "b": {
                            "type": "string",
                            "defaultValue": "1,0",
                            "menu": "blockMenu"
                        }
                    }
            },            
            {
                    "opcode": "turtleThickness",
                    "blockType": "command",
                    "text": "海龟画笔粗细 [n]",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": 1,
                        }
                    }
            },  
          {
                    "opcode": "pen",
                    "blockType": "command",
                    "text": "海龟画笔 [state]",
                    "arguments": {
                        "state": {
                            "type": "number",
                            "defaultValue": 1,
                            "menu": "penMenu"
                        }
                    }
            },     
            {
                    "opcode": "moveTurtle",
                    "blockType": "command",
                    "text": "海龟 [dir] [n]",
                    "arguments": {
                        "dir": {
                            "type": "number",
                            "menu": "moveMenu",
                            "defaultValue": 1
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "1"
                        },
                    }
            },            
            {
                    "opcode": "leftTurtle",
                    "blockType": "command",
                    "text": "海龟左转 [n] 度",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "rightTurtle",
                    "blockType": "command",
                    "text": "海龟右转 [n] 度",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
            {
                    "opcode": "turnTurtle",
                    "blockType": "command",
                    "text": "海龟 [dir] [n] 度",
                    "arguments": {
                        "dir": {
                            "type": "string",
                            "menu": "turnMenu",
                            "defaultValue": "pitch"
                        },
                        "n": {
                            "type": "number",
                            "defaultValue": "15"
                        },
                    }
            },            
         
            {
                    "opcode": "setTurtlePosition",
                    "blockType": "command",
                    "text": "海龟移动至 ([x],[y],[z])",
                    "arguments": {
                        "x": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "y": {
                            "type": "number",
                            "defaultValue": 0
                        },
                        "z": {
                            "type": "number",
                            "defaultValue": 0
                        },
                    }
            },            
            {
                    "opcode": "resetTurtleAngle",
                    "blockType": "command",
                    "text": "海龟恢复至 [n] 度",
                    "arguments": {
                        "n": {
                            "type": "number",
                            "defaultValue": "0"
                        },
                    }
            },

  
            ],
        "menus": {
            moveMenu: [{text:"前进",value:1}, {text:"后退",value:-1}],
            penMenu: [{text:"落笔",value:1}, {text:"抬笔",value:0}],
            coordinateMenu: [{text:"x",value:0}, {text:"y",value:1}, {text:"z",value:2}],
            /*turnMenu: [ "yaw", "pitch", "roll" ],*/
            turnMenu: [ {text:"XZ面内旋转",value:"yaw"}, {text:"XY面内旋转",value:"pitch"}, {text:"YZ面内旋转",value:"roll"}],
            modeMenu: [{text:"精确",value:1},{text:"方块",value:0}],
            entityMenu:{ acceptReporters: true,
                items:  [
                {text:"苦力怕",value:"Creeper"},
                {text:"骷髅",value:"Skeleton"},
                {text:"蜘蛛",value:"Spider"},
                {text:"巨型僵尸",value:"Giant"},
                {text:"僵尸",value:"Zombie"},
	{text:"尸壳",value:"Husk"},
                {text:"史莱姆",value:"Slime"},
                {text:"恶魂",value:"Ghast"},
                {text:"僵尸猪人",value:"PigZombie"},
                {text:"末影人",value:"Enderman"},
                {text:"洞穴蜘蛛",value:"CaveSpider"},
                {text:"蠹虫",value:"Silverfish"},
                {text:"烈焰人",value:"Blaze"},
                {text:"岩浆史莱姆",value:"LavaSlime"},
                {text:"末影龙boss",value:"EnderDragon"},
                {text:"凋零boss",value:"WitherBoss"},
                {text:"蝙蝠",value:"Bat"},
                {text:"女巫",value:"Witch"},
	{text:"幻术师",value:"Illusion_illager"},
                {text:"末影螨",value:"Endermite"},
                {text:"水下保卫",value:"Guardian"},
                {text:"猪",value:"Pig"},
                {text:"羊",value:"Sheep"},
                {text:"牛",value:"Cow"},
	{text:"骡",value:"Mule"},
	{text:"驴",value:"Donkey"},
                {text:"鸡",value:"Chicken"},
	{text:"鱿鱼",value:"Squid"},
                {text:"狼",value:"Wolf"},
                {text:"蘑菇牛",value:"MushroomCow"},
                {text:"雪傀儡",value:"SnowMan"},
                {text:"豹猫",value:"Ozelot"},
                {text:"铁傀儡",value:"VillagerGolem"},
                {text:"马",value:"EntityHorse"},
                {text:"兔子",value:"Rabbit"},
                {text:"村民",value:"Villager"},	
	{text:"北极熊",value:"PolarBear"},
	{text:"羊驼",value:"Llama"},
	{text:"恼鬼",value:"Vex"},			
	{text:"末影水晶",value:"EnderCrystal"},]
			},
 entityMenu2:{ acceptReporters: true,
                items:  [
	{text:"羊驼唾沫",value:"Llama_spit"},
                {text:"经验球",value:"XPOrb"},
                {text:"船",value:"Boat"},
                {text:"普通矿车",value:"MinecartRideable"},
                {text:"漏斗矿车",value:"MinecartHopper"},
                {text:"熔炉矿车",value:"MinecartFurnace"},
                {text:"指令方块矿车",value:"MinecartCommandBlock"},
                {text:"箱子矿车",value:"MinecartChest"},
                {text:"刷怪笼矿车",value:"MinecartSpawner"},
                {text:"小型火球（烈焰人发出的）",value:"SmallFireball"},
                {text:"火球（恶魂发出的）",value:"Fireball"},
                {text:"物品",value:"Item"},
                {text:"绳子结",value:"LeashKnot"},
                {text:"画",value:"Painting"},
                {text:"雷电",value:"LightningBolt"},
                {text:"已扔出的XP瓶子",value:"ThrownExpBottle"},
                {text:"凋零骷髅头（凋零Boss发出的骷髅头）",value:"WitherSkull"},
                {text:"末影水晶",value:"EnderCrystal "},
                {text:"已发出的烟火",value:"FireworksRocketEntity"},
                {text:"已射出的箭",value:"Arrow"},
                {text:"已扔出的药",value:"ThrownPotion"},
                {text:"已扔出的末影珍珠",value:"ThrownEnderpearl"},
                {text:"末影之眼的信号",value:"EyeOfEnderSignal"},
                {text:"掉落沙属性",value:"FallingSand"},
                {text:"物品显示",value:"ItemFrame"},
                {text:"鱼饵",value:"unknown"}]
			},
            blockMenu: { acceptReporters: true,
                items: [
                {text:"空气",value:"0,0"},
                {text:"基岩",value:"7,0"},
                {text:"书架",value:"47,0"},
                {text:"砖块",value:"45,0"},
                {text:"仙人掌",value:"81,0"},
                {text:"黑色地毯",value:"171,15"},
                {text:"蓝色地毯",value:"171,11"},
                {text:"棕色地毯",value:"171,12"},
                {text:"青色地毯",value:"171,9"},
                {text:"灰色地毯",value:"171,7"},
                {text:"绿色地毯",value:"171,13"},
                {text:"浅蓝色地毯",value:"171,3"},
                {text:"浅灰色地毯",value:"171,8"},
                {text:"绿黄色地毯",value:"171,5"},
                {text:"紫红色地毯",value:"171,2"},
                {text:"橙色地毯",value:"171,1"},
                {text:"粉红色地毯",value:"171,6"},
                {text:"紫色地毯",value:"171,10"},
                {text:"红色地毯",value:"171,14"},
                {text:"白色地毯",value:"171"},
                {text:"黄色地毯",value:"171,4"},
                {text:"箱子，面向北",value:"54,2"},
                {text:"箱子，面向南",value:"54,3"},
                {text:"箱子，面向西",value:"54,4"},
                {text:"箱子，面向东",value:"54,5"},
                {text:"粘土",value:"82,0"},
                {text:"煤块",value:"173,0"},
                {text:"煤矿石",value:"16,0"},
                {text:"鹅卵石",value:"4,0"},
                {text:"蛛网",value:"30,0"},
                {text:"制作桌",value:"58,0"},
                {text:"钻石方块",value:"57,0"},
                {text:"钻石原矿",value:"56,0"},
                {text:"灰尘",value:"3,0"},
                {text:"铁门",value:"71,0"},
                {text:"木门",value:"64,0"},
                {text:"农田",value:"60,0"},
                {text:"栅栏门",value:"107,0"},
                {text:"栅栏",value:"85,0"},
                {text:"火",value:"51,0"},
                {text:"小型花，虞美人",value:"38,0"},
	{text:"小型花，兰花",value:"38,1"},
	{text:"小型花，绒球葱",value:"38,2"},
	{text:"小型花，茜草花",value:"38,3"},
	{text:"小型花，红色郁金香",value:"38,4"},
	{text:"小型花，橙色郁金香",value:"38,5"},
	{text:"小型花，白色郁金香",value:"38,6"},
	{text:"小型花，粉红色郁金香",value:"38,7"},
	{text:"小型花，滨菊",value:"38,8"},
                {text:"大型花，向日葵",value:"175,0"},
                {text:"大型花，丁香",value:"175,1"},
                {text:"大型花，高草丛",value:"175,2"},
                {text:"大型花，大型蕨",value:"175,3"},
                {text:"大型花，玫瑰丛",value:"175,4"},
                {text:"大型花，牡丹",value:"175,5"},
                {text:"蒲公英",value:"37,0"},
                {text:"激活的火炉",value:"62,0"},
                {text:"非激活的火炉",value:"61,0"},
                {text:"玻璃窗格",value:"102,0"},
                {text:"玻璃",value:"20,0"},
                {text:"发光石块",value:"89,0"},
                {text:"黄金方块",value:"41,0"},
                {text:"黄金原矿",value:"14,0"},
                {text:"草垛",value:"31,0"},
                {text:"草",value:"2,0"},
                {text:"碎石",value:"13,0"},
                {text:"黑色硬化粘土",value:"159,15"},
                {text:"蓝色硬化粘土",value:"159,11"},
                {text:"棕色硬化粘土",value:"159,12"},
                {text:"青色硬化粘土",value:"159,9"},
                {text:"灰色硬化粘土",value:"159,7"},
                {text:"绿色硬化粘土",value:"159,13"},
                {text:"浅蓝色硬化粘土",value:"159,3"},
                {text:"浅灰色硬化粘土",value:"159,8"},
                {text:"绿黄色硬化粘土",value:"159,5"},
                {text:"紫红色硬化粘土",value:"159,2"},
                {text:"橙色硬化粘土",value:"159,1"},
                {text:"粉红色硬化粘土",value:"159,6"},
                {text:"紫色硬化粘土",value:"159,10"},
                {text:"红色硬化粘土",value:"159,14"},
                {text:"白色硬化粘土",value:"159,0"},
                {text:"黄色硬化粘土",value:"159,4"},
                {text:"冰",value:"79,0"},
                {text:"铁块",value:"42,0"},
                {text:"铁矿石",value:"15,0"},
                {text:"楼梯，东",value:"65,0"},
	{text:"楼梯，西",value:"65,1"},
	{text:"楼梯，南",value:"65,2"},
	{text:"楼梯，北",value:"65,3"},
	{text:"床，床头朝向南方",value:"26,0"},
	{text:"床，床头朝向西方",value:"26,1"},
	{text:"床，床头朝向北方",value:"26,2"},
	{text:"床，床头朝向东方",value:"26,3"},
                {text:"青金石",value:"22,0"},
                {text:"青金石原矿",value:"21,0"},
                {text:"流动的岩浆",value:"10,0"},
                {text:"静止的岩浆",value:"11,0"},
                {text:"桦树叶",value:"18,6"},
                {text:"丛林叶",value:"18,7"},
                {text:"橡木叶",value:"18,4"},
                {text:"云杉叶",value:"18,5"},
                {text:"树叶",value:"18,0"},
                {text:"西瓜",value:"103,0"},
	{text:"干海绵",value:"19,0"},
	{text:"湿海绵",value:"19,1"},
                {text:"青苔石",value:"48,0"},
                {text:"棕色蘑菇",value:"39,0"},
                {text:"红色蘑菇",value:"40,0"},
                {text:"黑石",value:"49,0"},
                {text:"石英块",value:"155,0"},
                {text:"红石",value:"152,0"},
                {text:"红石火把未激活",value:"75,0"},
                {text:"红石火把激活",value:"76,0"},
                {text:"红石灯激活",value:"124,0"},
                {text:"红石灯未激活",value:"123,0"},
                {text:"红石原矿",value:"73,0"},
                {text:"沙子",value:"12,0"},
                {text:"砂岩",value:"24,0"},
                {text:"树苗",value:"6,0"},
                {text:"海晶灯",value:"169,0"},
                {text:"雪块",value:"80,0"},
                {text:"雪",value:"78,0"},
                {text:"黑色玻璃",value:"95,15"},
                {text:"蓝色玻璃",value:"95,11"},
                {text:"棕色玻璃",value:"95,12"},
                {text:"青色玻璃",value:"95,9"},
                {text:"灰色玻璃",value:"95,7"},
                {text:"绿色玻璃",value:"95,13"},
                {text:"浅蓝色玻璃",value:"95,3"},
                {text:"浅灰色玻璃",value:"95,8"},
                {text:"绿黄色玻璃",value:"95,5"},
                {text:"紫红色玻璃",value:"95,2"},
                {text:"橙色玻璃",value:"95,1"},
                {text:"粉红色玻璃",value:"95,6"},
                {text:"紫色玻璃",value:"95,10"},
                {text:"红色玻璃",value:"95,14"},
                {text:"白色玻璃",value:"95,0"},
                {text:"黄色玻璃",value:"95,4"},
                {text:"鹅卵石台阶",value:"67,0"},
                {text:"木台阶",value:"53,0"},
                {text:"石头砖块",value:"98,0"},
                {text:"石头双层板",value:"43,0"},
                {text:"石头单层板",value:"44,0"},
                {text:"石头",value:"1,0"},
                {text:"甘蔗",value:"83,0"},
                {text:"TNT",value:"46,0"},
                {text:"火把，指向东侧",value:"50,1"},
	{text:"火把，指向西侧",value:"50,2"},
	{text:"火把，指向南侧",value:"50,3"},
	{text:"火把，指向北侧",value:"50,4"},
	{text:"火把，指向上侧",value:"50,5"},
                {text:"流动的水",value:"8,0"},
                {text:"静止的水",value:"9,0"},
                {text:"木头按钮，按钮在方块底部朝向下",value:"143,0"},
	{text:"木头按钮，按钮在方块侧面朝向东",value:"143,1"},
	{text:"木头按钮，按钮在方块侧面朝向西",value:"143,2"},
	{text:"木头按钮，按钮在方块侧面朝向南",value:"143,3"},
	{text:"木头按钮，按钮在方块侧面朝向北",value:"143,4"},
	{text:"木头按钮，按钮在方块顶部朝向上",value:"143,5"},
                {text:"厚木板",value:"5,0"},
                {text:"木头",value:"17,0"},
                {text:"黑色羊毛",value:"35,15"},
                {text:"蓝色羊毛",value:"35,11"},
                {text:"褐色羊毛",value:"35,12"},
                {text:"青色羊毛",value:"35,9"},
                {text:"灰色羊毛",value:"35,7"},
                {text:"绿色羊毛",value:"35,13"},
                {text:"浅蓝色羊毛",value:"35,3"},
                {text:"浅灰色羊毛",value:"35,8"},
                {text:"绿黄色羊毛",value:"35,5"},
                {text:"紫红色羊毛",value:"35,2"},
                {text:"橙色羊毛",value:"35,1"},
                {text:"粉红色羊毛",value:"35,6"},
                {text:"紫色羊毛",value:"35,10"},
                {text:"红色羊毛",value:"35,14"},
                {text:"白色羊毛",value:"35,0"},
                {text:"黄色羊毛",value:"35,4"},
	{text:"南瓜方块，朝向南边",value:"86,0"},
	{text:"南瓜方块，朝向西边",value:"86,1"},
	{text:"南瓜方块，朝向北边",value:"86,2"},
	{text:"南瓜方块，朝向东边",value:"86,3"},
	{text:"南瓜灯，朝向南边",value:"91,0"},
	{text:"南瓜灯，朝向西边",value:"91,1"},
	{text:"南瓜灯，朝向北边",value:"91,2"},
	{text:"南瓜灯，朝向东边",value:"91,3"},
                {text:"平直激活铁轨，南北走向",value:"27,0"},
	{text:"平直激活铁轨，东西走向",value:"27,1"},
	{text:"倾斜激活铁轨，朝东",value:"27,2"},
	{text:"倾斜激活铁轨，朝西",value:"27,3"},
	{text:"倾斜激活铁轨，朝北",value:"27,4"},
	{text:"倾斜激活铁轨，朝南",value:"27,5"},
                {text:"平直充能铁轨，南北走向",value:"157,0"},
	{text:"平直充能铁轨，东西走向",value:"157,1"},
	{text:"倾斜充能铁轨，朝东",value:"157,2"},
	{text:"倾斜充能铁轨，朝西",value:"157,3"},
	{text:"倾斜充能铁轨，朝北",value:"157,4"},
	{text:"倾斜充能铁轨，朝南",value:"157,5"},
                {text:"平直铁轨，南北走向",value:"66,0"},
	{text:"平直铁轨，东西走向",value:"66,1"},
	{text:"倾斜铁轨，朝东",value:"66,2"},
	{text:"倾斜铁轨，朝西",value:"66,3"},
	{text:"倾斜铁轨，朝北",value:"66,4"},
	{text:"倾斜铁轨，朝南",value:"66,5"},
	{text:"拐弯铁轨，朝向东南",value:"66,6"},
	{text:"拐弯铁轨，朝向西南",value:"66,7"},
	{text:"拐弯铁轨，朝向西北",value:"66,8"},
                {text:"平直探测铁轨，南北走向",value:"28,0"},
	{text:"平直探测铁轨，东西走向",value:"28,1"},
	{text:"倾斜探测铁轨，朝东",value:"28,2"},
	{text:"倾斜探测铁轨，朝西",value:"28,3"},
	{text:"倾斜探测铁轨，朝北",value:"28,4"},
	{text:"倾斜探测铁轨，朝南",value:"28,5"},
                {text:"拉杆，方块底部的拉杆关闭时指向东。",value:"69,0"},
	{text:"拉杆，方块侧面的拉杆指向东。",value:"69,1"},
	{text:"拉杆，方块侧面的拉杆指向西。",value:"69,2"},
	{text:"拉杆，方块侧面的拉杆指向南。",value:"69,3"},
	{text:"拉杆，方块侧面的拉杆指向北。",value:"69,4"},
	{text:"拉杆，方块顶部的拉杆关闭时指向南。",value:"69,5"},
	{text:"拉杆，方块顶部的拉杆关闭时指向东。",value:"69,6"},
	{text:"拉杆，方块底部的拉杆关闭时指向南。",value:"69,7"},
                {text:"石质按钮，按钮在方块底部朝向下",value:"77,0"},
	{text:"石质按钮，按钮在方块侧面朝向东",value:"77,1"},
	{text:"石质按钮，按钮在方块侧面朝向西",value:"77,2"},
	{text:"石质按钮，按钮在方块侧面朝向南",value:"77,3"},
	{text:"石质按钮，按钮在方块侧面朝向北",value:"77,4"},
	{text:"石质按钮，按钮在方块顶部朝向上",value:"77,5"},
	{text:"活塞，向下",value:"33,0"},
	{text:"活塞，向上",value:"33,1"},
	{text:"活塞，向北",value:"33,2"},
	{text:"活塞，向南",value:"33,3"},
	{text:"活塞，向西",value:"33,4"},
	{text:"活塞，向东",value:"33,5"},

            ]            
            }
            }
        };
    };
    
    parseXYZ(x,y,z) {
        var coords = [];
        if (typeof(x)=="string" && x.indexOf(",") >= 0) {
            return x.split(",").map(parseFloat);
        }
        else {
            return [x,y,z];
        }
    }

    parseXYZ2(x1,y1,z1,x2,y2,z2) {
        var coords = [];
        if (typeof(x1)=="string" && x1.indexOf(",") >= 0) {
            return x1.split(",").map(parseFloat);
        }
        else {
            return [x1,y1,z1,x2,y2,z2];
        }
    }

    parseXYZ3(x,y,z,r) {
        var coords = [];
        if (typeof(x)=="string" && x.indexOf(",") >= 0) {
            return x.split(",").map(parseFloat);
        }
        else {
            return [x,y,z,r];
        }
    }

    parseXYZ4(x,z) {
        var coords = [];
        if (typeof(x)=="string" && x.indexOf(",") >= 0) {
            return x.split(",").map(parseFloat);
        }
        else {
            return [x,z];
        }
    }

    blockByName({name}){
        return name;
    }
    
    sendAndReceive(msg) {
        var zjc = this;
        return new Promise(function(resolve, reject) {            
            zjc.socket.onmessage = function(event) {
                resolve(event.data.trim());
            };
            zjc.socket.onerror = function(err) {
                reject(err);
            };
            zjc.socket.send(msg);
        });
    };
    
    resume() {
        if (this.savedBlocks != null) {
            for (var [key, value] of this.savedBlocks)
                this.socket.send("world.setBlock("+key+","+value+")");
            this.savedBlocks = null;
        }
    };
    
    suspend() {
        if (this.savedBlocks == null) {
            this.savedBlocks = new Map();
        }
    };
    
/*   setBlocks({x1,y1,z1,x2,y2,z2,b}) {
            var [x1,y1,z1,x2,y2,z2] = this.parseXYZ2(x1,y1,z1,x2,y2,z2).map(Math.floor);
            for (var k=0;k<=(y2-y1);k++)
	{
	  for  (var j=0;j<=(z2-z1);j++)
	      {
                          for (var i=0;i<=(x2-x1);i++)
                                  {
                                     this.drawBlock(x1+i,y1+k,z1+j,b);
                                   }
                      }
	}
    };*/

 setBlocks({x1,y1,z1,x2,y2,z2,b}) {
            var [x1,y1,z1,x2,y2,z2] = this.parseXYZ2(x1,y1,z1,x2,y2,z2).map(Math.floor);
           this.socket.send("world.setBlocks("+x1+","+y1+","+z1+","+x2+","+y2+","+z2+","+b+")");


}

  drawBlock(x,y,z,b) {
        if (this.savedBlocks != null) {
            this.savedBlocks.set(""+x+","+y+","+z, b);
        }
        else {
            this.socket.send("world.setBlock("+x+","+y+","+z+","+b+")");
        }
    };

    drawLine(x1,y1,z1,x2,y2,z2) {
        var l = this.getLine(x1,y1,z1,x2,y2,z2);
        
        for (var i=0; i<l.length ; i++) {
            this.drawBlock(l[i][0],l[i][1],l[i][2],this.turtle.block);
        }
    };
    
    turnTurtle({dir,n}) {
        if (dir=="right" || dir=="yaw") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));    
        }
        else if (dir=="pitch") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.pitchMatrix(n));    
        }
        else { // if (dir=="roll") {
            this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.rollMatrix(n));    
        }
    };
    
    leftTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(-n));    
    }
    
    rightTurtle({n}) {
        this.turtle.matrix = this.turtle.mmMultiply(this.turtle.matrix, this.turtle.yawMatrix(n));
    }
    
    resetTurtleAngle({n}) {
        this.turtle.matrix = this.turtle.yawMatrix(n);
    };
    
    pen({state}) {
        this.turtle.penDown = state;
    }
    
    turtleBlock({b}) {
        this.turtle.block = b;
    }
    
    turtleBlockEasy({b}) {
        this.turtle.block = b;
    }
    
    setTurtlePosition({x,y,z}) {
        this.turtle.pos = this.parseXYZ(x,y,z);
    }
    
    turtleThickness({n}) {
        if (n==0) {
            this.turtle.nib = [];
        }
        else if (n==1) {
            this.turtle.nib = [[0,0,0]];
        }
        else if (n==2) {
            this.turtle.nib = [];
            for (var x=0; x<=1; x++) 
                for (var y=0; y<=1; y++) 
                    for (var z=0; z<=1; z++) 
                        this.turtle.nib.push([x,y,z]);
        }
        else {
            var r2 = n*n/4;
            var d = Math.ceil(n/2);
            this.turtle.nib = [];
            for (var x=-d; x<=d; x++) 
                for (var y=-d; y<=d; y++) 
                    for (var z=-d; z<=d; z++) 
                        if (x*x+y*y+z*z <= r2)
                            this.turtle.nib.push([x,y,z]);
        }
    }
    
    saveTurtle() {
        var t = this.turtle.clone();
        this.turtleHistory.push(t);
    }
    
    restoreTurtle() {
        if (this.turtleHistory.length > 0) {
            this.turtle = this.turtleHistory.pop();
        }
    }

    drawPoint(x0,y0,z0) {
        var l = this.turtle.nib.length;
        if (l == 0) {
            return;
        }
        else if (l == 1) {
            this.drawBlock(x0,y0,z0,this.turtle.block)
            return;
        }

        for (var i = 0 ; i < l ; i++) {
            var p = this.turtle.nib[i];
            var x = p[0] + x0;
            var y = p[1] + y0;
            var z = p[2] + z0;
            this.drawBlock(x,y,z,this.turtle.block)
        }
    };

    moveTurtle({dir,n}) {
        n *= dir;
        var newX = this.turtle.pos[0] + this.turtle.matrix[0][2] * n;
        var newY = this.turtle.pos[1] + this.turtle.matrix[1][2] * n;
        var newZ = this.turtle.pos[2] + this.turtle.matrix[2][2] * n;
        if (this.turtle.penDown != 0)
            this.drawLine(Math.round(this.turtle.pos[0]),Math.round(this.turtle.pos[1]),Math.round(this.turtle.pos[2]),Math.round(newX),Math.round(newY),Math.round(newZ));
        this.turtle.pos = [newX,newY,newZ];
    }; 
    
    getPosition() {
        return this.sendAndReceive("player.getPos()")
            .then(pos => {
                var p = pos.split(",");
                return [parseFloat(p[0]),parseFloat(p[1]),parseFloat(p[2])];
            });
    };

    spawnEntity1({entity,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z);
        return this.sendAndReceive("world.spawnEntity("+entity+","+x+","+y+","+z+")"); // TODO: do something with entity ID?
    };

    spawnEntity2({entity,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z);
        return this.sendAndReceive("world.spawnEntity("+entity+","+x+","+y+","+z+")"); // TODO: do something with entity ID?
    };

    movePlayerTop() {
        return this.getPosition().then(pos => 
            this.sendAndReceive("world.getHeight("+Math.floor(pos[0])+","+Math.floor(pos[2])+")").then(
                height => this.setPlayerPos({x:pos[0],y:height,z:pos[2]})));
    };

    getRotation() {
        return this.sendAndReceive("player.getRotation()")
            .then(r => {
                return parseFloat(r);
            });
    };
    
    getBlock({x,y,z}) {
        var pos = ""+this.parseXYZ(x,y,z).map(Math.floor);
        if (this.savedBlocks != null) {
            if (this.savedBlocks.has(pos)) {
                var b = this.savedBlocks.get(pos);
                if (b.indexOf(",")<0)
                    return ""+b+",0";
                else
                    return b;
            }
        }
        return this.sendAndReceive("world.getBlockWithData("+pos+")")
            .then(b => {
                return b;
            });
    };

    onBlock({b}) {
        return this.getPosition().then( pos => this.sendAndReceive("world.getBlockWithData("+Math.floor(pos[0])+","+Math.floor(pos[1]-1)+","+Math.floor(pos[2])+")")
                    .then( block => block == b ) );
    }

    haveBlock({b,x,y,z}) {
        var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
        return this.sendAndReceive("world.getBlockWithData("+x+","+y+","+z+")")
            .then(block => {
                return block == b;
            });
    };
    
    getPlayerVector({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? ""+pos[0]+","+pos[1]+","+pos[2] : ""+Math.floor(pos[0])+","+Math.floor(pos[1])+","+Math.floor(pos[2]));
    };
    
    makeVector({x,y,z}) {
        return ""+x+","+y+","+z
    }
    
    getHit() {
        if (this.hits.length>0) 
            return ""+this.hits.shift().slice(0,3);
        var zjc = this;
        return this.sendAndReceive("events.block.hits()")
            .then(result => {
                if (result.indexOf(",") < 0) 
                    return "";
                
                else {
                    var hits = result.split("|");
                    for(var i=0;i<hits.length;i++)
                        zjc.hits.push(hits[i].split(",").map(parseFloat));
                }
                return ""+this.shift.pop().slice(0,3);
            });
    };

    extractFromVector({vector,coordinate}) {
        var v = vector.split(",");
        if (v.length <= coordinate) {
            return 0.;
        }
        else {
            return parseFloat(v[coordinate]);
        }
    };

    getPlayerX({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[0] : Math.floor(pos[0]));
    };

    getPlayerY({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[1] : Math.floor(pos[1]));
    };

    getPlayerZ({mode}) {
        return this.getPosition()
            .then(pos => mode != 0 ? pos[2] : Math.floor(pos[2]));
    };

    connect_p({ip}){
        this.ip = ip;
        var zjc = this;
        return new Promise(function(resolve, reject) {
            if (zjc.socket != null)
                zjc.socket.close();
            zjc.clear();
            zjc.socket = new WebSocket("ws://"+ip+":14711");
            zjc.socket.onopen = function() {                
                resolve();
            };
            zjc.socket.onerror = function(err) {
                reject(err);
            };
        }).then(result => zjc.getPosition().then( result => {
            zjc.turtle.pos = result;
        })).then (result => zjc.getRotation().then( result => {
            zjc.playerRot = result;
            zjc.turtle.matrix = zjc.turtle.yawMatrix(Math.floor(0.5+result/90)*90);
        }));
    };
    
    chat({msg}){
        this.socket.send("chat.post("+msg+")");
    };
    
    getLine(x1,y1,z1,x2,y2,z2) {
        var line = [];
        x1 = Math.floor(x1);
        y1 = Math.floor(y1);
        z1 = Math.floor(z1);
        x2 = Math.floor(x2);
        y2 = Math.floor(y2);
        z2 = Math.floor(z2);
        var point = [x1,y1,z1];
        var dx = x2 - x1;
        var dy = y2 - y1;
        var dz = z2 - z1;
        var x_inc = dx < 0 ? -1 : 1;
        var l = Math.abs(dx);
        var y_inc = dy < 0 ? -1 : 1;
        var m = Math.abs(dy);
        var z_inc = dz < 0 ? -1 : 1;
        var n = Math.abs(dz);
        var dx2 = l * 2;
        var dy2 = m * 2;
        var dz2 = n * 2;
        
        var nib = this.turtle.nib;
        
        var draw = function(x,y,z) {
            for (var i=0; i<nib.length; i++) {
                var nx = x + nib[i][0];
                var ny = y + nib[i][1];
                var nz = z + nib[i][2];
                var j;
                for (j=0; j<line.length; j++) {
                    if (line[j][0] == nx && line[j][1] == ny && line[j][2] == nz)
                        break;
                }
                if (j<line.length)
                    continue;
                line.push([nx,ny,nz]);
            }
        };

        if (l >= m && l >= n) {
            var err_1 = dy2 - l;
            var err_2 = dz2 - l;
            for (var i=0; i<l; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dx2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dx2;
                }
                err_1 += dy2;
                err_2 += dz2;
                point[0] += x_inc;
            }
        }
        else if (m >= l && m >= n) {
            err_1 = dx2 - m;
            err_2 = dz2 - m;
            for (var i=0; i<m; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[0] += x_inc;
                    err_1 -= dy2;
                }
                if (err_2 > 0) {
                    point[2] += z_inc;
                    err_2 -= dy2;
                }
                err_1 += dx2;
                err_2 += dz2;
                point[1] += y_inc;
            }
        }
        else {
            err_1 = dy2 - n;
            err_2 = dx2 - n;
            for (var i=0; i < n; i++) {
                draw(point[0],point[1],point[2]);
                if (err_1 > 0) {
                    point[1] += y_inc;
                    err_1 -= dz2;
                }
                if (err_2 > 0) {
                    point[0] += x_inc;
                    err_2 -= dz2;
                }
                err_1 += dy2;
                err_2 += dx2;
                point[2] += z_inc;
            }
        }
        draw(point[0],point[1],point[2]);
        if (point[0] != x2 || point[1] != y2 || point[2] != z2) {
            draw(x2,y2,z2);
        }
        return line;
    };
    
    setBlock({x,y,z,b}) {
      var [x,y,z] = this.parseXYZ(x,y,z).map(Math.floor);
      this.drawBlock(x,y,z,b);
    };

    setPlayerPos({x,y,z}) {
      var [x,y,z] = this.parseXYZ(x,y,z);
      this.socket.send("player.setPos("+x+","+y+","+z+")");
    };

 getHeight({x,z}) {
      var [x,z] = this.parseXYZ4(x,z).map(Math.floor);
       return this.sendAndReceive("world.getHeight("+x+","+z+")").then(
                height => {return parseFloat(height);});
    };


}

(function() {
    var extensionClass = RaspberryJamMod
    if (typeof window === "undefined" || !window.vm) {
        Scratch.extensions.register(new extensionClass())
    }
    else {
        var extensionInstance = new extensionClass(window.vm.extensionManager.runtime)
        var serviceName = window.vm.extensionManager._registerInternalExtension(extensionInstance)
        window.vm.extensionManager._loadedExtensions.set(extensionInstance.getInfo().id, serviceName)
    }
})()
