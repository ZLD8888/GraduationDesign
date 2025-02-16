const app = getApp();
import * as echarts from '../../ec-canvas/echarts';

Page({
  data: {
    role: '',
    elderlyList: [],
    selectedElderlyIndex: 0,
    heartRate: null,
    lastUpdateTime: '',
    timeRange: 'day',
    isConnected: false,
    alerts: [],
    ecOption: {
      lazyLoad: true
    }
  },

  onLoad() {
    // 获取用户角色
    const role = wx.getStorageSync('role');
    this.setData({ role });

    // 获取可查看的老人列表
    this.loadElderlyList();
  },

  async loadElderlyList() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    const role = this.data.role;

    try {
      let url = `${app.globalData.baseUrl}/api/health/elderly/list`;
      
      // 根据角色设置不同的查询参数
      if (role === 'ADMIN') {
        // 管理员可以查看所有老人
        url += '?all=true';
      } else if (role === 'STAFF') {
        // 护工查看绑定的老人
        url += `?staffId=${userId}`;
      } else if (role === 'FAMILY') {
        // 家属查看绑定的老人
        url += `?familyId=${userId}`;
      } else {
        // 老人只能查看自己
        const elderlyInfo = {
          id: userId,
          name: wx.getStorageSync('userName')
        };
        this.setData({ 
          elderlyList: [elderlyInfo],
          selectedElderlyIndex: 0
        });
        this.initHealthMonitor(elderlyInfo.id);
        return;
      }

      const res = await wx.request({
        url,
        method: 'GET',
        header: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (res.data.code === '200') {
        this.setData({
          elderlyList: res.data.data,
          selectedElderlyIndex: 0
        });
        
        if (res.data.data.length > 0) {
          this.initHealthMonitor(res.data.data[0].id);
        }
      }
    } catch (error) {
      console.error('获取老人列表失败:', error);
      wx.showToast({
        title: '获取老人列表失败',
        icon: 'none'
      });
    }
  },

  handleElderlyChange(e) {
    const index = e.detail.value;
    this.setData({ selectedElderlyIndex: index });
    
    // 切换老人时重新初始化监控
    const elderlyId = this.data.elderlyList[index].id;
    this.initHealthMonitor(elderlyId);
  },

  initHealthMonitor(elderlyId) {
    // 关闭之前的连接
    if (this.websocket) {
      this.websocket.close();
    }

    // 初始化WebSocket连接
    this.initWebSocket(elderlyId);
    
    // 初始化图表
    this.initChart();
    
    // 加载历史数据
    this.loadHistoryData(this.data.timeRange, elderlyId);
  },

  onUnload() {
    if (this.websocket) {
      this.websocket.close();
    }
  },

  initWebSocket(elderlyId) {
    const token = wx.getStorageSync('token');
    
    this.websocket = wx.connectSocket({
      url: `wss://localhost:8080/ws-health?token=${token}&userId=${elderlyId}`, //需要更改
      success: () => {
        console.log('WebSocket连接成功');
        this.setData({ isConnected: true });
      }
    });

    this.websocket.onMessage((res) => {
      const data = JSON.parse(res.data);
      this.handleHealthData(data);
    });

    this.websocket.onClose(() => {
      console.log('WebSocket连接断开');
      this.setData({ isConnected: false });
      this.reconnect();
    });

    this.websocket.onError((error) => {
      console.error('WebSocket错误:', error);
      this.setData({ isConnected: false });
    });
  },

  reconnect() {
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.initWebSocket();
        this.reconnectTimer = null;
      }, 5000);
    }
  },

  handleHealthData(data) {
    // 更新实时数据
    this.setData({
      heartRate: data.heartRate,
      lastUpdateTime: this.formatTime(data.timestamp)
    });

    // 检查异常值
    if (data.heartRate > 100 || data.heartRate < 60) {
      this.addAlert(`心率异常: ${data.heartRate}次/分`);
    }

    // 更新图表
    this.updateChart(data);
  },

  initChart() {
    this.ecComponent = this.selectComponent('#heart-rate-chart');
    this.ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });

      const option = {
        grid: {
          top: 20,
          right: 20,
          bottom: 30,
          left: 40
        },
        xAxis: {
          type: 'time',
          axisLine: { lineStyle: { color: '#999' } },
          axisLabel: { fontSize: 10 }
        },
        yAxis: {
          type: 'value',
          min: 40,
          max: 120,
          axisLine: { lineStyle: { color: '#999' } },
          axisLabel: { fontSize: 10 }
        },
        series: [{
          type: 'line',
          smooth: true,
          data: [],
          itemStyle: {
            color: '#ff4d4f'
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: 'rgba(255, 77, 79, 0.3)'
            }, {
              offset: 1,
              color: 'rgba(255, 77, 79, 0.1)'
            }])
          }
        }]
      };

      chart.setOption(option);
      this.chart = chart;
      return chart;
    });
  },

  updateChart(data) {
    if (!this.chart) return;
    
    const series = this.chart.getOption().series;
    const newData = [...series[0].data, {
      value: [data.timestamp, data.heartRate]
    }];

    // 保留最近的数据点
    const keepPoints = this.data.timeRange === 'day' ? 288 : 2016; // 5分钟一个点
    if (newData.length > keepPoints) {
      newData.shift();
    }

    this.chart.setOption({
      series: [{
        data: newData
      }]
    });
  },

  changeTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({ timeRange: range });
    // 重新加载对应时间范围的数据
    this.loadHistoryData(range);
  },

  loadHistoryData(range, elderlyId) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/health/history`,
      method: 'GET',
      data: { 
        range,
        elderlyId 
      },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200') {
          this.chart.setOption({
            series: [{
              data: res.data.data
            }]
          });
        }
      }
    });
  },

  addAlert(message) {
    const alerts = [{
      id: Date.now(),
      message,
      time: this.formatTime(Date.now())
    }, ...this.data.alerts].slice(0, 5);

    this.setData({ alerts });
  },

  formatTime(timestamp) {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  }
}); 