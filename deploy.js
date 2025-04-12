/**
 * deploy.js
 *
 * 用于自动部署项目。
 *
 * 功能：
 * 1. 执行构建命令，如 pnpm run build:dev
 * 2. 连接 FTP 服务器（172.20.135.54:21）
 * 3. 将 dist 目录内容上传到远程目录，如：/wrh/learning
 *    - 如果目录不存在则创建
 *    - 如果目录已存在则清空后再上传
 *
 * 使用方法：
 *   node deploy.js，或封装成 CLI 命令，如：pnpm run deploy:dev
 *
 * 依赖：
 *   - basic-ftp（用于FTP操作）、winston（用于日志记录）：pnpm add basic-ftp winston -D
 */
import { exec } from 'node:child_process';
import path, { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import ftp from 'basic-ftp';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()]
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// FTP 配置
const FTP_CONFIG = {
  host: '172.20.135.54',
  port: 21,
  user: 'appuser',
  password: 'appuser.appuser'
};
// 远程目录
const REMOTE_DIR = '/wrh/learning';
// 本地 dist 文件夹路径
const LOCAL_DIST_PATH = path.resolve(__dirname, 'dist');
// 构建命令
const BUILD_COMMAND = 'pnpm run build:dev';
// 是否输出详细日志
const IS_VERBOSE = false;

// 构建项目
async function buildProject() {
  logger.info(`开始执行 ${BUILD_COMMAND}...`);
  return new Promise((resolve, reject) => {
    exec(BUILD_COMMAND, { cwd: __dirname }, (error, stdout, stderr) => {
      if (error) {
        logger.error('构建失败：', stderr);
        logger.error('构建输出：', stdout);
        reject(error);
      } else {
        logger.info('构建完成！');
        resolve(stdout);
      }
    });
  });
}

// 上传 dist 文件夹
async function uploadDist() {
  const client = new ftp.Client();
  client.ftp.verbose = IS_VERBOSE;

  try {
    await client.access(FTP_CONFIG);
    logger.info('成功连接到 FTP');

    // 确保路径存在
    await ensureDirExists(client, REMOTE_DIR);

    // 清空目标目录
    logger.info(`清空远程目录 ${REMOTE_DIR}...`);
    await client.clearWorkingDir();

    // 上传本地 dist 文件夹内容
    logger.info('开始上传 dist 文件夹...');
    await client.uploadFromDir(LOCAL_DIST_PATH);
    logger.info('上传完成！');
  } catch (err) {
    logger.error('FTP 上传失败：', err);
  } finally {
    client.close();
  }
}

// 确保路径存在
async function ensureDirExists(client, remoteDir) {
  const dirs = remoteDir.split('/').filter(Boolean);
  for (const dir of dirs) {
    try {
      await client.cd(dir);
    } catch {
      await client.send(`MKD ${dir}`);
      await client.cd(dir);
    }
  }
}

// 主函数
async function main() {
  try {
    await buildProject();
    await uploadDist();
  } catch (err) {
    logger.error('部署失败：', err);
  }
}

main();
