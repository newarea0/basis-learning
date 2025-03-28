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
