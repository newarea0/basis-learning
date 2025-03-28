让我帮您创建一个使用 `Navigator.mediaDevices` API 的录音和播放示例。

```思维导图
开始：录音播放功能实现分析
├── 技术要点
│   ├── Navigator.mediaDevices.getUserMedia() 获取麦克风权限
│   ├── MediaRecorder API 实现录音功能
│   ├── Audio API 实现播放功能
│   └── Blob 对象处理音频数据
├── 功能模块
│   ├── 录音控制
│   ├── 音频播放
│   └── 状态管理
└── 用户体验
    ├── 按钮交互
    ├── 状态提示
    └── 错误处理
结束：录音播放功能实现分析
```

首先，我将修改 HTML 文件，添加必要的 UI 元素：


```html:audio/index.html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>录音播放示例</title>
  <style>
    .container {
      max-width: 600px;
      margin: 50px auto;
      text-align: center;
    }
    .btn {
      padding: 10px 20px;
      margin: 10px;
      font-size: 16px;
      cursor: pointer;
      border: none;
      border-radius: 5px;
      background-color: #4CAF50;
      color: white;
    }
    .btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    #status {
      margin: 20px 0;
      font-size: 18px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>录音播放示例</h1>
    <div id="status">准备就绪</div>
    <button id="startBtn" class="btn">开始录音</button>
    <button id="stopBtn" class="btn" disabled>停止录音</button>
    <button id="playBtn" class="btn" disabled>播放录音</button>
    <audio id="audioPlayer" controls style="display: none;"></audio>
  </div>
  <script src="index.js"></script>
</body>
</html>
```
现在，我将编写 JavaScript 代码来实现录音和播放功能：



```javascript:audio/index.js
// 获取DOM元素
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const playBtn = document.getElementById('playBtn');
const status = document.getElementById('status');
const audioPlayer = document.getElementById('audioPlayer');

// 初始化变量
let mediaRecorder = null;
let audioChunks = [];

// 开始录音
startBtn.addEventListener('click', async () => {
  try {
    // 请求麦克风权限
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    
    // 创建 MediaRecorder 实例
    mediaRecorder = new MediaRecorder(stream);
    
    // 收集音频数据
    mediaRecorder.addEventListener('dataavailable', (event) => {
      audioChunks.push(event.data);
    });
    
    // 录音结束时的处理
    mediaRecorder.addEventListener('stop', () => {
      const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
      const audioUrl = URL.createObjectURL(audioBlob);
      audioPlayer.src = audioUrl;
      audioPlayer.style.display = 'block';
      playBtn.disabled = false;
      status.textContent = '录音完成，可以播放了';
    });
    
    // 开始录音
    mediaRecorder.start();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    playBtn.disabled = true;
    status.textContent = '正在录音...';
    
  } catch (error) {
    console.error('获取麦克风权限失败:', error);
    status.textContent = '获取麦克风权限失败，请检查权限设置';
  }
});

// 停止录音
stopBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    mediaRecorder.stream.getTracks().forEach(track => track.stop());
    startBtn.disabled = false;
    stopBtn.disabled = true;
  }
});

// 播放录音
playBtn.addEventListener('click', () => {
  audioPlayer.play();
  status.textContent = '正在播放录音...';
});

// 播放结束时的处理
audioPlayer.addEventListener('ended', () => {
  status.textContent = '播放完成';
});
```
```功能说明
开始：录音播放功能说明
├── 界面功能
│   ├── 开始录音按钮：启动录音功能
│   ├── 停止录音按钮：结束录音
│   ├── 播放录音按钮：播放已录制的音频
│   └── 状态显示：显示当前操作状态
├── 核心功能
│   ├── 录音功能
│   │   ├── 获取麦克风权限
│   │   ├── 创建 MediaRecorder 实例
│   │   └── 收集音频数据
│   └── 播放功能
│       ├── 创建音频 Blob
│       ├── 生成音频 URL
│       └── 播放音频
└── 错误处理
    └── 麦克风权限获取失败处理
结束：录音播放功能说明
```

这个示例实现了以下功能：

1. 用户界面
   - 清晰的按钮布局
   - 状态提示
   - 响应式设计

2. 录音功能
   - 使用 `navigator.mediaDevices.getUserMedia()` 获取麦克风权限
   - 使用 `MediaRecorder` API 进行录音
   - 实时状态更新

3. 播放功能
   - 将录音数据转换为可播放的音频
   - 使用原生 `audio` 元素播放
   - 播放状态管理

使用方法：
1. 点击"开始录音"按钮开始录音
2. 点击"停止录音"按钮结束录音
3. 录音完成后，点击"播放录音"按钮播放录音

注意事项：
1. 首次使用时需要允许浏览器访问麦克风
2. 建议使用现代浏览器（Chrome、Firefox、Edge 等）
3. 确保设备有可用的麦克风

您现在可以直接在浏览器中打开 `index.html` 文件来测试这个录音播放功能。如果您需要任何修改或有其他需求，请随时告诉我。
