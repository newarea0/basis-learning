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
async function getRecordings() {
    try {
        const response = await fetch('http://localhost:3000/api/video/list');
        if (!response.ok) {
            throw new Error('获取列表失败');
        }
        const videos = await response.json();
        return videos.map(video => ({
            id: video._id,
            name: video.filename,
            duration: video.duration,
            date: video.recordTime,
            data: `http://localhost:3000/${video.filePath}`
        }));
    } catch (error) {
        console.error('获取录制列表失败:', error);
        return [];
    }
}

// 添加录制记录
async function addRecording(blob, duration) {
    try {
        // 创建 FormData 对象
        const formData = new FormData();
        // 添加视频文件
        formData.append('video', blob, `recording_${Date.now()}.webm`);
        formData.append('duration', duration);
        formData.append('recordTime', new Date().toISOString());

        // 发送到服务器
        const response = await fetch('http://localhost:3000/api/video/upload', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('上传失败');
        }

        const result = await response.json();
        console.log('上传成功:', result);
        
        // 更新列表显示
        await updateRecordingsList();
    } catch (error) {
        console.error('保存录制失败:', error);
        alert('保存录制失败，请检查网络连接。');
    }
}

// 更新录制列表显示
async function updateRecordingsList() {
    try {
        const recordings = await getRecordings();
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
    } catch (error) {
        console.error('更新列表失败:', error);
        alert('更新列表失败，请刷新页面重试。');
    }
}

// 预览录制文件
async function previewRecording(id) {
    try {
        const recordings = await getRecordings();
        const recording = recordings.find(r => r.id === id);
        if (recording) {
            previewTitle.textContent = recording.name;
            previewVideo.src = recording.data;
            previewModal.style.display = 'flex';
            previewVideo.play();
        }
    } catch (error) {
        console.error('预览失败:', error);
        alert('预览失败，请重试。');
    }
}

// 关闭预览
function closePreview() {
    previewVideo.pause();
    previewVideo.currentTime = 0;
    previewModal.style.display = 'none';
    if (previewVideo.src) {
        URL.revokeObjectURL(previewVideo.src);
    }
}

// 下载单个录制文件
async function downloadRecording(id) {
    try {
        const recordings = await getRecordings();
        const recording = recordings.find(r => r.id === id);
        if (recording) {
            // 获取视频数据
            const response = await fetch(recording.data);
            const blob = await response.blob();
            
            // 创建 Blob URL
            const blobUrl = window.URL.createObjectURL(blob);
            
            // 创建下载链接
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = recording.name || 'video.webm';
            document.body.appendChild(a);
            a.click();
            
            // 清理
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        }
    } catch (error) {
        console.error('下载失败:', error);
        alert('下载失败，请重试。');
    }
}

// 删除录制文件
async function deleteRecording(id) {
    try {
        const response = await fetch(`http://localhost:3000/api/video/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) {
            throw new Error('删除失败');
        }

        // 更新列表显示
        await updateRecordingsList();
        
        // 如果正在预览被删除的视频，关闭预览
        if (previewVideo.src) {
            closePreview();
        }
    } catch (error) {
        console.error('删除失败:', error);
        alert('删除失败，请重试。');
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

    mediaRecorder.onstop = async () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        videoPreview.srcObject = null;
        videoPreview.src = URL.createObjectURL(blob);
        
        // 添加录制记录
        const duration = Date.now() - startTime;
        await addRecording(blob, duration);
        
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
    
    // 清理预览视频的 URL
    if (previewVideo.src) {
        URL.revokeObjectURL(previewVideo.src);
    }
});
