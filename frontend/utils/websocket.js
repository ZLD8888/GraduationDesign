const app = getApp();

export function initWebSocket(userId, onMessage, onClose) {
  const token = wx.getStorageSync('token');
  
  if (!userId) {
    console.error('WebSocket初始化失败: userId不能为空');
    return null;
  }

  if (!token) {
    console.error('WebSocket初始化失败: token不能为空');
    return null;
  }

  let isConnecting = false;
  let ws = null;
  let retryCount = 0;
  const MAX_RETRY = 3;  // 最大重试次数

  const connect = () => {
    if (isConnecting || retryCount >= MAX_RETRY) {
      if (retryCount >= MAX_RETRY) {
        console.log('达到最大重试次数，停止重连');
        wx.showToast({
          title: '连接服务器失败',
          icon: 'none',
          duration: 2000
        });
      }
      return null;
    }

    isConnecting = true;
    retryCount++;

    console.log(`第 ${retryCount} 次尝试连接WebSocket...`);
    // setTimeout(() => {
      // 构建WebSocket URL，将token和userId作为查询参数
      const wsUrl = `${app.globalData.wsUrl}/ws-health?token=${encodeURIComponent(token)}&userId=${encodeURIComponent(userId)}`;
      
    ws = wx.connectSocket({
      url: wsUrl,
      header: {
        'content-type': 'application/json'
      },
      success: () => {
        console.log('WebSocket连接请求发送成功');
      },
      fail: (error) => {
        console.error('WebSocket连接请求失败:', error);
        isConnecting = false;
        onClose && onClose();
      }
    });

    ws.onOpen(() => {
      console.log('WebSocket连接已打开');
      isConnecting = false;
      retryCount = 0;  // 连接成功后重置重试计数
    });

    ws.onMessage((res) => {
      try {
        const data = JSON.parse(res.data);
        if (data.type === 'AUTH_SUCCESS') {
          console.log('WebSocket认证成功');
        } else if (data.code === 404) {
          console.log('暂无心率数据');
          onMessage && onMessage({ heartRate: null, timestamp: Date.now() });
        } else {
          onMessage && onMessage(data);
        }
      } catch (e) {
        console.error('解析WebSocket消息失败:', e);
      }
    });

    ws.onClose(() => {
      console.log('WebSocket连接断开');
      isConnecting = false;
      onClose && onClose();
    });

    ws.onError((error) => {
      console.error('WebSocket错误:', error);
      isConnecting = false;
      onClose && onClose();
    });

    return ws;
  };

  return connect();
} 