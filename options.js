// 默认范本
const defaultTemplates = {
  "什么策略": "关于加密市场的策略",
  "多少钱": "买策略50，提供原理和操作方法，可以手工验证，需要自动交易可以购买代码800元",
  "价格": "买策略50，提供原理和操作方法，可以手工验证，需要自动交易可以购买代码800元",
  "收益": "收益每月10%左右",
  "apy": "收益每月10%左右",
  "风险": "没有策略是无风险的，只是要控制风险",
  "有风险": "没有策略是无风险的，只是要控制风险",
  "原理": "买策略50，提供原理和操作方法",
  "试用": "不能试用，买策略50",
  "部署": "部署费用200元",
  "代码": "自动交易代码800元，部署费用200元"
};

// 加载配置
chrome.storage.sync.get([
  'templates',
  'checkInterval',
  'aiModel',
  'ollamaUrl',
  'defaultResponse'
], (data) => {
  document.getElementById('checkInterval').value = data.checkInterval || 5000;
  document.getElementById('aiModel').value = data.aiModel || 'template';
  document.getElementById('ollamaUrl').value = data.ollamaUrl || 'http://localhost:11434';
  document.getElementById('defaultResponse').value = data.defaultResponse || '不好意思客官，我是AI助理，这个问题我不会，我马上告诉小主，他会马上来的，请稍后。';
  
  const templates = data.templates || defaultTemplates;
  renderTemplates(templates);
});

// 渲染范本
function renderTemplates(templates) {
  const container = document.getElementById('templatesContainer');
  container.innerHTML = '';
  
  for (const [key, value] of Object.entries(templates)) {
    const item = document.createElement('div');
    item.className = 'template-item';
    item.innerHTML = `
      <input type="text" class="template-key" value="${key}" placeholder="关键词">
      <input type="text" class="template-value" value="${value}" placeholder="回复内容">
      <button class="btn-delete">❌</button>
    `;
    container.appendChild(item);
  }
}

// 保存设置
document.getElementById('saveBtn').addEventListener('click', () => {
  const templates = {};
  document.querySelectorAll('.template-item').forEach(item => {
    const key = item.querySelector('.template-key').value.trim();
    const value = item.querySelector('.template-value').value.trim();
    if (key && value) {
      templates[key] = value;
    }
  });
  
  const config = {
    templates,
    checkInterval: parseInt(document.getElementById('checkInterval').value),
    aiModel: document.getElementById('aiModel').value,
    ollamaUrl: document.getElementById('ollamaUrl').value,
    defaultResponse: document.getElementById('defaultResponse').value
  };
  
  chrome.storage.sync.set(config, () => {
    showMessage('设置已保存！', 'success');
  });
});

// 恢复默认
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('确定要恢复默认设置吗？')) {
    renderTemplates(defaultTemplates);
    document.getElementById('checkInterval').value = 5000;
    document.getElementById('aiModel').value = 'template';
    document.getElementById('ollamaUrl').value = 'http://localhost:11434';
    document.getElementById('defaultResponse').value = '不好意思客官，我是AI助理，这个问题我不会，我马上告诉小主，他会马上来的，请稍后。';
    showMessage('已恢复默认设置', 'success');
  }
});

// 添加范本
document.getElementById('addTemplateBtn').addEventListener('click', () => {
  const container = document.getElementById('templatesContainer');
  const item = document.createElement('div');
  item.className = 'template-item';
  item.innerHTML = `
    <input type="text" class="template-key" placeholder="关键词">
    <input type="text" class="template-value" placeholder="回复内容">
    <button class="btn-delete">❌</button>
  `;
  container.appendChild(item);
});

// 删除范本
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('btn-delete')) {
    e.target.parentElement.remove();
  }
});

// 显示消息
function showMessage(text, type) {
  const msg = document.getElementById('message');
  msg.textContent = text;
  msg.className = `message ${type}`;
  setTimeout(() => {
    msg.textContent = '';
    msg.className = 'message';
  }, 3000);
}
