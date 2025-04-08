document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('start-btn');
  const siriResponse = document.getElementById('siri-response');
  const status = document.getElementById('status');
  
  // 检查浏览器是否支持语音识别
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    status.textContent = '你的浏览器不支持语音识别功能，请使用Chrome或Edge浏览器';
    startBtn.disabled = true;
    return;
  }

  // 创建语音识别实例
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // 配置语音识别
  recognition.lang = 'zh-CN'; // 设置语言为中文
  recognition.continuous = false; // 不连续识别
  recognition.interimResults = false; // 不返回临时结果

  // 语音合成
  const speechSynthesis = window.speechSynthesis;
  
  // 处理按钮按下事件
  let isHolding = false;
  
  startBtn.addEventListener('mousedown', startListening);
  startBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    startListening();
  });
  
  startBtn.addEventListener('mouseup', stopListening);
  startBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    stopListening();
  });
  
  // 处理键盘空格键
  document.body.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !isHolding) {
      e.preventDefault();
      startListening();
    }
  });
  
  document.body.addEventListener('keyup', (e) => {
    if (e.code === 'Space' && isHolding) {
      e.preventDefault();
      stopListening();
    }
  });

  function startListening() {
    if (isHolding) return;
    
    isHolding = true;
    startBtn.classList.add('active');
    
    // 激活波形动画
    if (window.siriWaveAnimation) {
      window.siriWaveAnimation.activate();
    }
    
    status.textContent = '正在聆听...';
    
    try {
      recognition.start();
    } catch (error) {
      console.error('语音识别启动失败:', error);
      status.textContent = '语音识别启动失败，请重试';
      resetState();
    }
  }

  function stopListening() {
    if (!isHolding) return;
    
    isHolding = false;
    startBtn.classList.remove('active');
    status.textContent = '正在处理...';
    
    try {
      recognition.stop();
    } catch (error) {
      console.error('语音识别停止失败:', error);
      resetState();
    }
  }

  // 语音识别结果处理
  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript.trim();
    status.textContent = `你说: "${transcript}"`;
    
    // 根据语音内容处理响应
    processCommand(transcript);
  };

  recognition.onerror = (event) => {
    console.error('语音识别错误:', event.error);
    status.textContent = `识别错误: ${event.error}`;
    resetState();
  };

  recognition.onend = () => {
    if (isHolding) {
      // 如果用户仍在按住按钮，重新开始识别
      try {
        recognition.start();
      } catch (error) {
        console.error('重新启动语音识别失败:', error);
        resetState();
      }
    } else {
      resetState();
    }
  };

  // 处理命令
  function processCommand(command) {
    let response = '';
    
    // 转换为小写以便于匹配
    const lowerCommand = command.toLowerCase();
    
    // 简单的命令匹配
    if (lowerCommand.includes('你好') || lowerCommand.includes('嗨') || lowerCommand.includes('hi')) {
      response = '你好！有什么可以帮助你的吗？';
    } else if (lowerCommand.includes('时间') || lowerCommand.includes('几点')) {
      const now = new Date();
      response = `现在是${now.getHours()}点${now.getMinutes()}分。`;
    } else if (lowerCommand.includes('日期') || lowerCommand.includes('几号') || lowerCommand.includes('今天')) {
      const now = new Date();
      response = `今天是${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日。`;
    } else if (lowerCommand.includes('天气')) {
      response = '抱歉，我现在无法获取天气信息。';
    } else if (lowerCommand.includes('笑话') || lowerCommand.includes('讲个笑话')) {
      const jokes = [
        '为什么程序员总是分不清万圣节和圣诞节？因为 Oct 31 和 Dec 25 是一样的。',
        '一个程序员走进酒吧，要了一杯浮点型啤酒。酒保说："对不起，我们只提供整数型啤酒。"',
        '怎么叫醒一个睡着的程序员？你不需要，他们一会就会timeout了。',
        '一个氧原子跑到物理学家那里说："我丢了一个电子！" 物理学家问："你确定吗？" 氧原子说："我是阳离子的！"'
      ];
      response = jokes[Math.floor(Math.random() * jokes.length)];
    } else if (lowerCommand.includes('谢谢') || lowerCommand.includes('感谢')) {
      response = '不客气，随时为你服务！';
    } else if (lowerCommand.includes('再见') || lowerCommand.includes('拜拜')) {
      response = '再见！有需要随时呼叫我。';
    } else if (lowerCommand.includes('你是谁') || lowerCommand.includes('你叫什么')) {
      response = '我是Siri，你的个人语音助手。';
    } else if (lowerCommand.includes('名字')) {
      response = '我的名字是Siri，很高兴认识你！';
    } else {
      response = '抱歉，我不太理解你说的话。你能换个方式问我吗？';
    }
    
    // 显示响应
    siriResponse.textContent = response;
    
    // 语音播报响应
    speak(response);
  }

  // 语音合成播报
  function speak(text) {
    // 如果已经在播放，先停止
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.pitch = 1;
    utterance.rate = 1;
    utterance.volume = 1;
    
    // 选择中文语音（如果有）
    const voices = speechSynthesis.getVoices();
    const chineseVoice = voices.find(voice => voice.lang.includes('zh-'));
    if (chineseVoice) {
      utterance.voice = chineseVoice;
    }
    
    speechSynthesis.speak(utterance);
    
    utterance.onstart = () => {
      // 激活波形动画
      if (window.siriWaveAnimation) {
        window.siriWaveAnimation.activate();
      }
    };
    
    utterance.onend = () => {
      // 停用波形动画
      if (window.siriWaveAnimation) {
        window.siriWaveAnimation.deactivate();
      }
      status.textContent = '点击按钮开始说话';
    };
  }

  // 重置状态
  function resetState() {
    isHolding = false;
    startBtn.classList.remove('active');
    
    if (!speechSynthesis.speaking) {
      // 停用波形动画
      if (window.siriWaveAnimation) {
        window.siriWaveAnimation.deactivate();
      }
      status.textContent = '点击按钮开始说话';
    }
  }

  // 确保在页面加载时获取可用的语音
  speechSynthesis.onvoiceschanged = () => {
    speechSynthesis.getVoices();
  };
}); 