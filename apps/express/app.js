const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');
const fileUploadRoutes = require('./routes/fileUpload');
const videoRoutes = require('./routes/video');

const app = express();

// MongoDB 连接
mongoose.connect('mongodb://localhost:27017/video-recording', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB 连接成功'))
.catch(err => console.error('MongoDB 连接失败:', err));

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 路由配置
app.use('/api/upload', fileUploadRoutes);
app.use('/api/video', videoRoutes);

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: err.message
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`服务器运行在端口 ${PORT}`);
}); 