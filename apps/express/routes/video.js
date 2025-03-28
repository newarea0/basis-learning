const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Video = require('../models/Video');

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// 上传视频并保存元数据
router.post('/upload', upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: '没有上传文件' });
    }

    const { duration, recordTime } = req.body;
    
    const video = new Video({
      filename: req.file.originalname,
      duration: parseFloat(duration),
      recordTime: new Date(recordTime),
      filePath: req.file.path
    });

    await video.save();
    res.status(201).json({
      message: '视频上传成功',
      video: video
    });
  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 获取所有视频列表
router.get('/list', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.json(videos);
  } catch (error) {
    console.error('获取视频列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

// 删除视频
router.delete('/:id', async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);
    if (!video) {
      return res.status(404).json({ message: '视频不存在' });
    }

    // 删除文件
    const filePath = path.join(__dirname, '..', video.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 删除数据库记录
    await Video.findByIdAndDelete(req.params.id);
    res.json({ message: '视频删除成功' });
  } catch (error) {
    console.error('删除视频错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
});

module.exports = router; 