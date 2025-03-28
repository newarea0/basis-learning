// 全局变量
let currentStream = null;
let currentFacingMode = 'user'; // 'user' 为前置摄像头，'environment' 为后置摄像头
let devices = [];

// DOM 元素
const videoElement = document.getElementById('videoElement');
const switchButton = document.getElementById('switchCamera');
const takePhotoButton = document.getElementById('takePhoto');
const startButton = document.getElementById('startCamera');
const photoCanvas = document.getElementById('photoCanvas');
const photoContext = photoCanvas.getContext('2d');

// 获取可用设备列表
async function getDevices() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        console.log(1, devices);
        return devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
        console.error('获取设备列表失败:', error);
        return [];
    }
}

// 启动摄像头
async function startCamera(facingMode = 'user') {
    try {
        // 如果已经有视频流，先停止
        if (currentStream) {
            currentStream.getTracks().forEach(track => track.stop());
        }

        const constraints = {
            video: {
                facingMode: facingMode,
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
        };

        currentStream = await navigator.mediaDevices.getUserMedia(constraints);
        videoElement.srcObject = currentStream;
        currentFacingMode = facingMode;
    } catch (error) {
        console.error('启动摄像头失败:', error);
        alert('启动摄像头失败，请检查权限设置');
    }
}

// 切换摄像头
async function switchCamera() {
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    await startCamera(newFacingMode);
}

// 拍照功能
function takePhoto() {
    if (!currentStream) {
        alert('请先开启摄像头');
        return;
    }

    // 设置canvas尺寸与视频一致
    photoCanvas.width = videoElement.videoWidth;
    photoCanvas.height = videoElement.videoHeight;

    // 将视频帧绘制到canvas
    photoContext.drawImage(videoElement, 0, 0, photoCanvas.width, photoCanvas.height);

    // 将canvas内容转换为图片
    const photo = photoCanvas.toDataURL('image/jpeg');
    
    // 创建下载链接
    const link = document.createElement('a');
    link.download = `photo-${new Date().getTime()}.jpg`;
    link.href = photo;
    link.click();
}

// 事件监听
startButton.addEventListener('click', () => startCamera());
switchButton.addEventListener('click', switchCamera);
takePhotoButton.addEventListener('click', takePhoto);

// 页面加载时获取设备列表
window.addEventListener('load', async () => {
    devices = await getDevices();
    if (devices.length === 0) {
        alert('未检测到摄像头设备');
        return;
    }
});
