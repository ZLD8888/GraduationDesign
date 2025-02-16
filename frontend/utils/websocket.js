const app = getApp();

export function initWebSocket(userId, onMessage, onClose) {
  const token = wx.getStorageSync('token');
  const ws = wx.connectSocket({
    url: `${app.globalData.wsUrl}/ws-health?token=${token}&userId=${userId}`,
    header: {
      'content-type': 'application/json'
    },
    success: () => {
      console.log('WebSocket连接成功');
    }
  });

  ws.onMessage((res) => {
    try {
      const data = JSON.parse(res.data);
      onMessage && onMessage(data);
    } catch (e) {
      console.error('解析WebSocket消息失败:', e);
    }
  });

  ws.onClose(() => {
    console.log('WebSocket连接断开');
    onClose && onClose();
  });

  return ws;
} 