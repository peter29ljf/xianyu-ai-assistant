// 监控配置
let monitorEnabled = false;
let checkInterval = 5000; // 5秒检查一次
let monitorIntervalId = null;
let processedMessages = new Set();

// 初始化
chrome.storage.sync.get(['monitorEnabled', 'checkInterval'], (data) => {
  monitorEnabled = data.monitorEnabled || false;
  checkInterval = data.checkInterval || 5000;
  if (monitorEnabled) {
    startMonitoring();
  }
});

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'toggleMonitor') {
    monitorEnabled = request.enabled;
    if (monitorEnabled) {
      startMonitoring();
      sendResponse({ success: true, message: '监控已启动' });
    } else {
      stopMonitoring();
      sendResponse({ success: true, message: '监控已停止' });
    }
  } else if (request.action === 'getStatus') {
    sendResponse({ enabled: monitorEnabled });
  }
  return true;
});

// 开始监控
function startMonitoring() {
  console.log('开始监控闲鱼聊天...');
  if (monitorIntervalId) {
    clearInterval(monitorIntervalId);
  }
  
  monitorIntervalId = setInterval(() => {
    checkNewMessages();
  }, checkInterval);
  
  checkNewMessages();
}

// 停止监控
function stopMonitoring() {
  console.log('停止监控');
  if (monitorIntervalId) {
    clearInterval(monitorIntervalId);
    monitorIntervalId = null;
  }

}

// 检查新消息
function checkNewMessages() {
  // 查找最后一条消息
  const messages = document.querySelectorAll('[class*="message"], [class*="Message"]');
  if (messages.length === 0) return;
  
  const lastMessage = messages[messages.length - 1];
  const messageText = lastMessage.textContent.trim();
  const messageId = messageText + Date.now();
  
  if (processedMessages.has(messageId)) return;
  
  // 检查是否是客户消息
  const isSelfMessage = lastMessage.querySelector('[class*="self"]');
  if (isSelfMessage) return;
  
  console.log('检测到新消息:', messageText);
  processedMessages.add(messageId);
  
  // 检查关键词
  const keywords = ['策略', 'polymarket', '套利', '赚钱', '收益', 'apy', '风险', '价格', '购买', '多少钱', '原理', '部署'];
  const isRelevant = keywords.some(keyword => messageText.toLowerCase().includes(keyword.toLowerCase()));
  
  if (isRelevant) {
    generateReply(messageText).then(reply => {
      if (reply) {
        sendReply(reply);
      }
    });
  }
}

// 生成回复
async function generateReply(userMessage) {
  try {
    const config = await chrome.storage.sync.get(['templates', 'ollamaUrl', 'aiModel']);
    const templates = config.templates || getDefaultTemplates();
    
    // 匹配范本
    const reply = matchTemplate(userMessage, templates);
    if (reply) return reply;
    
    // 默认回复
    return '不好意思客官，我是AI助理，这个问题我不会，我马上告诉小主，他会马上来的，请稍后。';
  } catch (error) {
    console.error('生成回复失败:', error);
    return '不好意思客官，我是AI助理，这个问题我不会，我马上告诉小主，他会马上来的，请稍后。';
  }
}

// 匹配范本
function matchTemplate(userMessage, templates) {
  const msg = userMessage.toLowerCase();
  for (const [key, value] of Object.entries(templates)) {
    if (msg.includes(key.toLowerCase())) {
      return value;
    }
  }
  return null;
}

// 发送回复
async function sendReply(replyText) {
  try {
    const inputBox = document.querySelector('textarea, input[type="text"]');
    if (!inputBox) {
      console.error('未找到输入框');
      return;
    }
    
    inputBox.focus();
    inputBox.value = replyText;
    
    const inputEvent = new Event('input', { bubbles: true });
    inputBox.dispatchEvent(inputEvent);
    
    setTimeout(() => {
      const sendButton = document.querySelector('button[class*="send"], button[type="submit"]');
      if (sendButton) {
        sendButton.click();
        console.log('回复已发送:', replyText);
      } else {
        console.error('未找到发送按钮');
      }
    }, 500);
  } catch (error) {
    console.error('发送回复失败:', error);
  }
}

// 默认范本
function getDefaultTemplates() {
  return {
    "什么策略": "关于加密市场的策略",
    "多少钱": "买策略50，提供原理和操作方法，可以手工验证，需要自动交易可以购买代码800元",
    "价格": "买策略50，提供原理和操作方法，可以手工验证，需要自动交易可以购买代码800元",
    "收益": "收益每月10%左右",
    "apy": "收益每月10%左右",
    "风险": "没有策略是无风险的，只是要控制风险",
    "有风险": "没有策略是无风险的，只是要控制风险",
    "原理": "买策略50，提供原理和操作方法，可以手工验证，需要自动交易可以购买代码800元",
    "试用": "不能试用，买策略50，提供原理和操作方法，可以手工验证，需要自动交易可以购买代码",
    "部署": "部署费用200元",
    "代码": "自动交易代码800元，部署费用200元"
  };
}