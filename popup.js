document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('toggleBtn');
  const statusSpan = document.getElementById('status');
  const settingsBtn = document.getElementById('settingsBtn');
  
  // 检查当前状态
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].url.includes('goofish.com')) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getStatus' }, (response) => {
        if (response && response.enabled) {
          updateUI(true);
        }
      });
    }
  });
  
  // 切换监控
  toggleBtn.addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0] || !tabs[0].url.includes('goofish.com')) {
        alert('请在闲鱼聊天页面使用此扩展！');
        return;
      }
      
      const isEnabled = statusSpan.classList.contains('status-on');
      
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'toggleMonitor',
        enabled: !isEnabled
      }, (response) => {
        if (response && response.success) {
          updateUI(!isEnabled);
        }
      });
    });
  });
  
  // 打开设置
  settingsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
  
  function updateUI(enabled) {
    if (enabled) {
      statusSpan.textContent = '运行中';
      statusSpan.className = 'status-on';
      toggleBtn.textContent = '停止监控';
      toggleBtn.className = 'btn btn-danger';
    } else {
      statusSpan.textContent = '未启动';
      statusSpan.className = 'status-off';
      toggleBtn.textContent = '启动监控';
      toggleBtn.className = 'btn btn-primary';
    }
  }
});