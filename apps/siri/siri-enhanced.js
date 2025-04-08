document.addEventListener('DOMContentLoaded', () => {
  // 创建Siri波形动画的Canvas实现
  const siriAnimationContainer = document.querySelector('.siri-animation');
  
  // 清除原始的波形div
  const originalWave = document.querySelector('.siri-wave');
  if (originalWave) {
    originalWave.remove();
  }
  
  // 创建Canvas元素
  const canvas = document.createElement('canvas');
  canvas.id = 'siri-wave-canvas';
  canvas.width = 300;
  canvas.height = 150;
  siriAnimationContainer.appendChild(canvas);
  
  const ctx = canvas.getContext('2d');
  
  // 波形参数
  const waves = [
    { color: '#36d1dc', amplitude: 20, frequency: 0.02, speed: 0.03, phase: 0, active: false },
    { color: '#5b86e5', amplitude: 15, frequency: 0.03, speed: 0.02, phase: Math.PI/3, active: false },
    { color: '#d53369', amplitude: 25, frequency: 0.015, speed: 0.025, phase: Math.PI/4, active: false },
    { color: '#daae51', amplitude: 18, frequency: 0.025, speed: 0.035, phase: Math.PI/2, active: false }
  ];

  // 动画标志
  let animating = false;
  
  // 绘制波形
  function drawWave(time) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const centerY = canvas.height / 2;
    
    waves.forEach(wave => {
      ctx.beginPath();
      
      // 更新相位
      wave.phase += wave.speed;
      
      // 动态振幅，当激活时增加波形振幅
      const currentAmplitude = wave.active ? wave.amplitude * (1 + Math.sin(time * 0.002) * 0.3) : wave.amplitude * 0.3;
      
      for (let x = 0; x < canvas.width; x++) {
        const y = Math.sin(x * wave.frequency + wave.phase) * currentAmplitude;
        if (x === 0) {
          ctx.moveTo(x, centerY + y);
        } else {
          ctx.lineTo(x, centerY + y);
        }
      }
      
      ctx.strokeStyle = wave.color;
      ctx.lineWidth = 3;
      ctx.stroke();
    });
    
    if (animating) {
      requestAnimationFrame(drawWave);
    }
  }
  
  // 激活波形
  function activateWaves() {
    waves.forEach(wave => {
      wave.active = true;
    });
    
    if (!animating) {
      animating = true;
      requestAnimationFrame(drawWave);
    }
  }
  
  // 停用波形
  function deactivateWaves() {
    waves.forEach(wave => {
      wave.active = false;
    });
  }
  
  // 导出激活/停用方法供主脚本使用
  window.siriWaveAnimation = {
    activate: activateWaves,
    deactivate: deactivateWaves
  };
  
  // 初始化绘制静态波形
  animating = true;
  requestAnimationFrame(drawWave);
}); 