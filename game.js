// 游戏主逻辑
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameOver = document.getElementById('gameOver');
const scoreDisplay = document.getElementById('scoreDisplay');
const restartButton = document.getElementById('restartButton');
const scoreCounter = document.getElementById('scoreCounter');
const orientationReminder = document.getElementById('orientation-reminder');

// 移动端检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 设置画布大小函数
function setCanvasSize() {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isMobile) {
        if (isLandscape) {
            // 横屏模式：使用全屏宽度
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        } else {
            // 竖屏模式：使用较小的尺寸
            canvas.width = window.innerHeight * 2; // 2:1 比例
            canvas.height = window.innerHeight;
        }
    } else {
        // 桌面端：固定尺寸或响应式
        const maxWidth = Math.min(window.innerWidth * 0.9, 1200);
        const maxHeight = Math.min(window.innerHeight * 0.8, 600);
        
        // 保持2:1的宽高比
        if (maxWidth / maxHeight > 2) {
            canvas.width = maxHeight * 2;
            canvas.height = maxHeight;
        } else {
            canvas.width = maxWidth;
            canvas.height = maxWidth / 2;
        }
    }
    
    // 更新游戏对象位置
    updateGamePositions();
}

// 更新游戏对象位置
function updateGamePositions() {
    // 更新地面位置
    if (ground) {
        ground.y = canvas.height - 20;
    }
    
    // 更新玩家初始位置
    if (player) {
        player.x = 100;
        player.y = canvas.height - 60;
    }
    
    // 更新背景尺寸
    if (background) {
        background.width = canvas.width;
        background.height = canvas.height;
    }
    
    // 重新计算云朵位置
    if (clouds && clouds.length > 0) {
        clouds.forEach(cloud => {
            if (cloud.x > canvas.width) {
                cloud.x = canvas.width + Math.random() * 500;
            }
            if (cloud.y > canvas.height * 0.5) {
                cloud.y = Math.random() * (canvas.height * 0.5);
            }
        });
    }
    
    // 重新计算障碍物位置
    if (obstacles && obstacles.length > 0 && ground) {
        obstacles.forEach(obstacle => {
            obstacle.y = ground.y - obstacle.height;
        });
    }
}

// 屏幕方向检测
function checkOrientation() {
    const isLandscape = window.innerWidth > window.innerHeight;
    
    if (isMobile) {
        if (isLandscape) {
            // 横屏模式：隐藏提示，显示游戏
            orientationReminder.style.display = 'none';
            document.getElementById('game-container').style.display = 'block';
            
            // 如果游戏未运行且不在游戏结束状态，显示开始画面
            if (!gameRunning && gameOver.classList.contains('hidden')) {
                startScreen();
            }
        } else {
            // 竖屏模式：显示提示，隐藏游戏
            orientationReminder.style.display = 'flex';
            document.getElementById('game-container').style.display = 'none';
        }
    } else {
        // 桌面端：始终显示游戏
        orientationReminder.style.display = 'none';
        document.getElementById('game-container').style.display = 'block';
    }
}

// 游戏变量
let score = 0;
let gameRunning = false;
let gameSpeed = 3;
// 移除旧的间隔控制变量

// 玩家对象
const player = {
    x: 100,
    y: canvas.height - 60,
    width: 50,
    height: 50,
    velocityY: 0,
    jumping: false,
    jumpsRemaining: 4,
    gravity: 0.4,
    jumpForce: -15,
    sprite: {
        frameIndex: 0,
        frames: 4,
        frameCount: 0,
        frameSpeed: 5,
        color: '#FF5733'
    }
};

// 障碍物数组
const obstacles = [];

// 地面
const ground = {
    y: canvas.height - 20,
    height: 20,
    color: '#2E8B57'
};

// 背景
const background = {
    x: 0,
    width: canvas.width,
    height: canvas.height,
    color1: '#87CEEB', // 天空蓝色
    color2: '#E6F3FF', // 浅蓝色
    speed: 1
};

// 云朵数组
const clouds = [];

// 初始化画布大小和屏幕方向检测（在所有游戏对象定义之后）
setCanvasSize();
checkOrientation();

// 初始化函数
function init() {
    // 重新设置画布大小
    setCanvasSize();
    
    score = 0;
    gameSpeed = 3;
    obstacles.length = 0;
    clouds.length = 0;
    player.x = 100;
    player.y = canvas.height - 60;
    player.velocityY = 0;
    player.jumping = false;
    player.jumpsRemaining = 4;
    gameRunning = true;
    gameOver.classList.add('hidden');
    scoreDisplay.textContent = '0';
    scoreCounter.textContent = '分数: 0';
    
    // 生成初始云朵
    for (let i = 0; i < 5; i++) {
        createCloud();
    }
    
    // 开始游戏循环
    requestAnimationFrame(gameLoop);
}

// 游戏主循环
function gameLoop() {
    if (!gameRunning) return;
    
    // 清空画布
    drawBackground();
    
    // 更新和绘制云朵
    updateClouds();
    
    // 更新和绘制地面
    drawGround();
    
    // 更新和绘制玩家
    updatePlayer();
    drawPlayer();
    
    // 更新和绘制障碍物
    updateObstacles();
    drawObstacles();
    
    // 检测碰撞
    if (checkCollision()) {
        endGame();
        return;
    }
    
    // 更新分数
    updateScore();
    
    // 请求下一帧
    requestAnimationFrame(gameLoop);
}

// 绘制背景
function drawBackground() {
    // 渐变天空
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, background.color1);
    gradient.addColorStop(1, background.color2);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

// 创建云朵
function createCloud() {
    clouds.push({
        x: canvas.width + Math.random() * 500,
        y: Math.random() * (canvas.height * 0.5),
        width: 60 + Math.random() * 80,
        height: 40 + Math.random() * 40,
        speed: 0.5 + Math.random() * 0.5,
        color: 'white'
    });
}

// 更新云朵
function updateClouds() {
    for (let i = 0; i < clouds.length; i++) {
        clouds[i].x -= clouds[i].speed;
        drawCloud(clouds[i]);
        
        // 移除屏幕外的云朵
        if (clouds[i].x + clouds[i].width < 0) {
            clouds.splice(i, 1);
            i--;
            // 创建新云朵
            createCloud();
        }
    }
}

// 绘制云朵
function drawCloud(cloud) {
    ctx.fillStyle = cloud.color;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.width * 0.3, cloud.y - cloud.height * 0.2, cloud.width * 0.25, 0, Math.PI * 2);
    ctx.arc(cloud.x + cloud.width * 0.6, cloud.y, cloud.width * 0.3, 0, Math.PI * 2);
    ctx.fill();
}

// 绘制地面
function drawGround() {
    ctx.fillStyle = ground.color;
    ctx.fillRect(0, ground.y, canvas.width, ground.height);
}

// 更新玩家
function updatePlayer() {
    // 应用重力
    player.velocityY += player.gravity;
    player.y += player.velocityY;
    
    // 确保玩家不会穿过地面
    if (player.y > canvas.height - player.height - ground.height) {
        player.y = canvas.height - player.height - ground.height;
        player.velocityY = 0;
        player.jumping = false;
        player.jumpsRemaining = 4;
    }
    
    // 更新动画帧
    player.sprite.frameCount++;
    if (player.sprite.frameCount >= player.sprite.frameSpeed) {
        player.sprite.frameCount = 0;
        player.sprite.frameIndex = (player.sprite.frameIndex + 1) % player.sprite.frames;
    }
}

// 绘制玩家
function drawPlayer() {
    ctx.fillStyle = player.sprite.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // 简单的腿部动画
    if (!player.jumping) {
        const legHeight = 10 * Math.sin(player.sprite.frameIndex * Math.PI / 2);
        ctx.fillRect(player.x + 10, player.y + player.height, 10, -legHeight);
        ctx.fillRect(player.x + 30, player.y + player.height, 10, -legHeight);
    }
}

// 生成障碍物
function generateObstacle() {
    const obstacleHeight = 40 + Math.random() * 60;
    obstacles.push({
        x: canvas.width,
        y: ground.y - obstacleHeight,
        width: 30,
        height: obstacleHeight,
        color: '#8B4513'
    });
}

// 更新障碍物
function updateObstacles() {
    // 随机生成障碍物
    // 基于最后一个障碍物位置的间隔控制
    if (Math.random() < 0.01 && 
        (obstacles.length === 0 || 
         canvas.width - obstacles[obstacles.length - 1].x > 300)) {
        generateObstacle();
    }
    
    // 更新所有障碍物位置
    for (let i = 0; i < obstacles.length; i++) {
        obstacles[i].x -= gameSpeed;
        
        // 移除屏幕外的障碍物
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
            i--;
        }
    }
}

// 绘制障碍物
function drawObstacles() {
    for (let obstacle of obstacles) {
        ctx.fillStyle = obstacle.color;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }
}

// 碰撞检测
function checkCollision() {
    for (let obstacle of obstacles) {
        if (player.x < obstacle.x + obstacle.width &&
            player.x + player.width > obstacle.x &&
            player.y < obstacle.y + obstacle.height &&
            player.y + player.height > obstacle.y) {
            return true; // 碰撞发生
        }
    }
    return false;
}

// 更新分数
function updateScore() {
    score++;
    scoreCounter.textContent = `分数: ${Math.floor(score / 10)}`;
    
    // 逐渐增加游戏速度
    if (score % 1000 === 0) {
        gameSpeed += 0.5;
    }
}

// 结束游戏
function endGame() {
    gameRunning = false;
    const finalScore = Math.floor(score / 10);
    scoreDisplay.textContent = finalScore;
    gameOver.classList.remove('hidden');
}

// 处理键盘输入
function handleKeyDown(e) {
    if (e.code === 'Space') {
        if (!gameRunning) {
            init();
        } else if (player.jumpsRemaining > 0) {
            player.jumping = true;
            player.velocityY = player.jumpForce;
            player.jumpsRemaining--;
        }
    }
}

// 处理触摸输入（移动设备支持）
function handleTouchStart(e) {
    e.preventDefault();
    
    if (!gameRunning) {
        init();
        return;
    }
    
    // 多点触控支持：每个触摸点都可以触发跳跃
    for (let touch of e.touches) {
        if (player.jumpsRemaining > 0) {
            player.jumping = true;
            player.velocityY = player.jumpForce;
            player.jumpsRemaining--;
            break; // 一次只处理一个跳跃
        }
    }
}

// 处理触摸结束
function handleTouchEnd(e) {
    e.preventDefault();
}

// 处理触摸移动（防止默认滚动行为）
function handleTouchMove(e) {
    e.preventDefault();
}

// 重新开始按钮事件
restartButton.addEventListener('click', init);

// 添加事件监听
window.addEventListener('keydown', handleKeyDown);
canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
canvas.addEventListener('touchend', handleTouchEnd, { passive: false });
canvas.addEventListener('touchmove', handleTouchMove, { passive: false });

// 窗口大小变化监听
window.addEventListener('resize', () => {
    setCanvasSize();
    checkOrientation();
});

// 屏幕方向变化监听
window.addEventListener('orientationchange', () => {
    setTimeout(() => {
        setCanvasSize();
        checkOrientation();
    }, 100); // 延迟执行以确保方向变化完成
});

// 初始显示
function startScreen() {
    drawBackground();
    drawGround();
    
    // 绘制开始游戏提示
    ctx.fillStyle = 'black';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('2D横版跑酷游戏', canvas.width / 2, canvas.height / 2 - 50);
    ctx.font = '20px Arial';
    ctx.fillText('按空格键或点击屏幕跳跃', canvas.width / 2, canvas.height / 2);
    ctx.fillText('按空格键开始游戏', canvas.width / 2, canvas.height / 2 + 50);
}

// 显示开始屏幕
startScreen();
