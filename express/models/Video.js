const mongoose = require('mongoose');

// 视频模型
const videoSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  recordTime: {
    type: Date,
    required: true
  },
  filePath: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

// 导出视频模型对象
module.exports = mongoose.model('Video', videoSchema); 