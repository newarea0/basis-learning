import CryptoJS from 'crypto-js';

function decrypt(ciphertext, secretKey) {
  try {
    // 将 base64 编码的密钥转换为 CryptoJS 格式
    const key = CryptoJS.enc.Base64.parse(secretKey);
    
    // 将 base64 编码的密文转换为 CryptoJS 格式
    const encrypted = CryptoJS.enc.Base64.parse(ciphertext);
    
    // 创建解密配置
    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: encrypted },
      key,
      {
        mode: CryptoJS.mode.ECB,
        padding: CryptoJS.pad.Pkcs7
      }
    );
    
    // 转换为 UTF-8 字符串
    const originalText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!originalText) {
      throw new Error('解密失败：无法转换为有效文本');
    }
    
    return originalText;
  } catch (error) {
    console.error('解密过程中发生错误:', error);
    return null;
  }
}

// 示例使用
const secretKey = "3svY1/FsH1EgcRERsY2r2Q==";
// const encryptedText = "Ci2puqeMpLK/vFEP7UTXC4v56RX/wtzWEHCQTLsH9sg=";
const encryptedText = "68W9uxlW0EOugFu5ZkKd0vMirj9Tclk2cKtMaoCcmLaWRACRhFCfPwV+6OELXB4p3krjf7cYutbdsQP6twZ9fmhnTltFZ+bEGlvmBT2RsscGizRHYBcD/zuSkEr+arWNFDLtvSBf04V02BMZ2DTo5FplVXIb2Yn9OFOM/xbBAcvZbeoROxJlcyrmxWY78MPLRPEwgLSiQISINQSQuFg+0w==";
const decryptedText = decrypt(encryptedText, secretKey);
console.log("解密后的文本: ", decryptedText);
