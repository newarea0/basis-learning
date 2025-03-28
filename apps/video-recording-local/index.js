// 获取DOM元素
const videoPreview = document.getElementById('videoPreview');
const recordBtn = document.getElementById('recordBtn');
const timerDisplay = document.getElementById('timer');
const recordingsList = document.getElementById('recordingsList');
const previewModal = document.getElementById('previewModal');
const previewVideo = document.getElementById('previewVideo');
const previewTitle = document.getElementById('previewTitle');

// 全局变量
let mediaStream = null;
let mediaRecorder = null;
let recordedChunks = [];
let timerInterval = null;
let startTime = null;

// 格式化时间
function formatTime(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const pad = (num) => num.toString().padStart(2, '0');
    
    return `${pad(hours)}:${pad(minutes % 60)}:${pad(seconds % 60)}`;
}

// 格式化日期
function formatDate(date) {
    return new Date(date).toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

// 更新计时器显示
function updateTimer() {
    if (startTime) {
        const elapsed = Date.now() - startTime;
        timerDisplay.textContent = formatTime(elapsed);
    }
}

// 获取录制列表
function getRecordings() {
    const recordings = localStorage.getItem('recordings');
    return recordings ? JSON.parse(recordings) : [];
}

// 保存录制列表
function saveRecordings(recordings) {
    localStorage.setItem('recordings', JSON.stringify(recordings));
}

// 添加录制记录
function addRecording(blob, duration) {
    const recordings = getRecordings();
    const newRecording = {
        id: Date.now().toString(),
        name: `录制视频 ${recordings.length + 1}`,
        duration: duration,
        date: new Date().toISOString(),
        blob: URL.createObjectURL(blob)
    };
    recordings.push(newRecording);
    saveRecordings(recordings);
    updateRecordingsList();
}

// 更新录制列表显示
function updateRecordingsList() {
    const recordings = getRecordings();
    recordingsList.innerHTML = recordings.map(recording => `
        <div class="recording-item">
            <div class="recording-info">
                <div class="recording-name">${recording.name}</div>
                <div class="recording-details">
                    时长: ${formatTime(recording.duration)} | 
                    录制时间: ${formatDate(recording.date)}
                </div>
            </div>
            <div class="recording-actions">
                <button onclick="previewRecording('${recording.id}')">预览</button>
                <button onclick="downloadRecording('${recording.id}')">下载</button>
                <button onclick="deleteRecording('${recording.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

// 预览录制文件
function previewRecording(id) {
    const recordings = getRecordings();
    const recording = recordings.find(r => r.id === id);
    if (recording) {
        previewTitle.textContent = recording.name;
        previewVideo.src = recording.blob;
        previewModal.style.display = 'flex';
        previewVideo.play();
    }
}

// 关闭预览
function closePreview() {
    previewVideo.pause();
    previewVideo.currentTime = 0;
    previewModal.style.display = 'none';
}

// 下载单个录制文件
function downloadRecording(id) {
    const recordings = getRecordings();
    const recording = recordings.find(r => r.id === id);
    if (recording) {
        const a = document.createElement('a');
        a.href = recording.blob;
        a.download = `${recording.name}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
}

// 删除录制文件
function deleteRecording(id) {
    const recordings = getRecordings();
    const recording = recordings.find(r => r.id === id);
    if (recording) {
        URL.revokeObjectURL(recording.blob);
        const newRecordings = recordings.filter(r => r.id !== id);
        saveRecordings(newRecordings);
        updateRecordingsList();
        
        // 如果正在预览被删除的视频，关闭预览
        if (previewVideo.src === recording.blob) {
            closePreview();
        }
    }
}

// 初始化摄像头
async function initCamera() {
    try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true
        });
        videoPreview.srcObject = mediaStream;
    } catch (error) {
        console.error('摄像头初始化失败:', error);
        alert('无法访问摄像头，请确保已授予权限。');
    }
}

// 切换录制状态
function toggleRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        stopRecording();
    } else {
        startRecording();
    }
}

// 开始录制
function startRecording() {
    recordedChunks = [];
    mediaRecorder = new MediaRecorder(mediaStream, {
        mimeType: 'video/webm;codecs=vp9'
    });

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        videoPreview.srcObject = null;
        videoPreview.src = URL.createObjectURL(blob);
        
        // 添加录制记录
        const duration = Date.now() - startTime;
        addRecording(blob, duration);
        
        // 停止计时器
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        startTime = null;
        timerDisplay.textContent = '00:00:00';
        
        // 更新按钮状态
        recordBtn.textContent = '开始录制';
        recordBtn.classList.remove('recording');
    };

    mediaRecorder.start();
    recordBtn.textContent = '停止录制';
    recordBtn.classList.add('recording');
    
    // 开始计时
    startTime = Date.now();
    timerInterval = setInterval(updateTimer, 1000);
}

// 停止录制
function stopRecording() {
    mediaRecorder.stop();
}

// 事件监听
recordBtn.addEventListener('click', toggleRecording);

// 点击模态框背景关闭预览
previewModal.addEventListener('click', (e) => {
    if (e.target === previewModal) {
        closePreview();
    }
});

// 页面加载时初始化摄像头和录制列表
initCamera();
updateRecordingsList();

// 页面关闭时清理资源
window.addEventListener('beforeunload', () => {
    if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
    }
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }
    if (timerInterval) {
        clearInterval(timerInterval);
    }
    
    // 清理所有录制文件的 Blob URL
    const recordings = getRecordings();
    recordings.forEach(recording => {
        URL.revokeObjectURL(recording.blob);
    });
});
