const app = getApp();
import * as echarts from '../../ec-canvas/echarts';
import { initWebSocket } from '../../utils/websocket';

let chart = null;

// 定义图表选项
function initChartOption() {
  return {
    grid: {
      top: 20,
      right: 20,
      bottom: 30,
      left: 40,
      containLabel: true
    },
    xAxis: {
      type: 'time',
      axisLine: { lineStyle: { color: '#999' } },
      axisLabel: { 
        fontSize: 10,
        formatter: (value) => {
          const date = new Date(value);
          return `${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
      }
    },
    yAxis: {
      type: 'value',
      min: 40,
      max: 120,
      axisLine: { lineStyle: { color: '#999' } },
      axisLabel: { fontSize: 10 },
      splitLine: { show: true, lineStyle: { type: 'dashed' } }
    },
    series: [{
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 5,
      data: [],
      itemStyle: {
        color: '#ff4d4f',
        borderWidth: 2
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
}

Page({
  data: {
    role: '',
    elderlyList: [],
    selectedElderlyIndex: 0,
    heartRate: '--',
    lastUpdateTime: '等待数据...',
    timeRange: 'day',
    isConnected: false,
    alerts: [],
    chartData: [],
    ec: {
      onInit: function(canvas, width, height, dpr) {
        chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        canvas.setChart(chart);
        
        const option = initChartOption();
        chart.setOption(option);
        
        // 返回 chart 实例
        return chart;
      }
    }
  },

  onLoad() {
    // 获取用户角色
    const role = wx.getStorageSync('userRole');
    this.setData({ role });

    // 获取可查看的老人列表
    this.loadElderlyList();
  },

  onReady() {
    // 初始化图表
    this.initChart();
  },

  initChart() {
    this.ecComponent = this.selectComponent('#mychart-dom-line');
    if (this.ecComponent) {
      this.ecComponent.init((canvas, width, height, dpr) => {
        console.log('Chart initialization parameters:', { width, height, dpr });
        
        // 创建图表实例
        chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        
        // 设置canvas
        canvas.setChart(chart);
        
        // 设置图表配置
        const option = initChartOption();
        chart.setOption(option);

        // 如果已经有老人数据，立即加载历史数据
        if (this.data.elderlyList.length > 0) {
          const elderlyId = this.data.elderlyList[this.data.selectedElderlyIndex].id;
          this.loadHistoryData('day', elderlyId);
        }
        
        return chart;
      });
    } else {
      console.error('Failed to get chart component');
    }
  },

  loadElderlyList() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    const role = wx.getStorageSync('userRole');
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/health/elderly/list`,
      method: 'GET',
      data: {
        role: role,
        userId: userId
      },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200') {
          const elderlyList = res.data.data || [];
          this.setData({ elderlyList }, () => {
            // 在设置完elderlyList后，如果有老人数据，初始化第一个老人的健康监控
            if (elderlyList.length > 0) {
              const elderlyId = elderlyList[0].id;
              this.initHealthMonitor(elderlyId);
              
              // 如果图表已经初始化，加载历史数据
              if (chart) {
                this.loadHistoryData('day', elderlyId);
              }
            }
          });
        }
      }
    });
  },

  handleHealthData(data) {
    if (!data) return;
    
    // 更新实时数据
    const heartRate = data.heartRate || '--';
    const timestamp = data.timestamp ? new Date(data.timestamp) : new Date();
    
    this.setData({
      heartRate: heartRate,
      lastUpdateTime: this.formatTime(timestamp)
    });

    // 更新图表数据
    if (heartRate !== '--' && chart) {
      const newPoint = {
        value: [timestamp, heartRate]
      };
      
      let chartData = [...this.data.chartData];  // 创建数组副本
      chartData.push(newPoint);

      // 保留最近的数据点
      const keepPoints = this.data.timeRange === 'day' ? 288 : 2016; // 5分钟一个点
      if (chartData.length > keepPoints) {
        chartData = chartData.slice(-keepPoints);
      }

      this.setData({ chartData });
      
      if (chart) {
        chart.setOption({
          series: [{
            data: chartData
          }]
        });
      }

      // 检查异常值并添加告警
      if (heartRate < 60 || heartRate > 100) {
        this.addAlert(`心率异常: ${heartRate}次/分`);
      }
    }
  },

  handleElderlyChange(e) {
    const index = e.detail.value;
    this.setData({ selectedElderlyIndex: index });
    
    // 切换老人时重新初始化监控
    const elderlyId = this.data.elderlyList[index].elderlyUsersId;
    this.initHealthMonitor(elderlyId);
    // 加载默认24小时的历史数据
    this.loadHistoryData('day', elderlyId);
  },

  initHealthMonitor(elderlyId) {
    if (!elderlyId) {
      console.warn('elderlyId is required for health monitoring');
      return;
    }

    // 先检查设备绑定状态
    const token = wx.getStorageSync('token');
    const role = wx.getStorageSync('userRole');
    wx.request({
      url: `${app.globalData.baseUrl}/api/health/bind`,
      method: 'GET',
      data: { elderlyId },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200') {
          if (!res.data.data) {
            // 如果是老人角色且未绑定设备，显示授权窗口
            if (role === 'ELDERLY') {
              wx.showModal({
                title: '设备授权',
                content: '检测到您尚未绑定健康监测设备，是否现在绑定？',
                success: (modalRes) => {
                  if (modalRes.confirm) {
                    // 用户点击确定，执行绑定流程
                    this.bindDevice(elderlyId);
                  } else {
                    this.setData({
                      heartRate: '--',
                      lastUpdateTime: '未绑定设备',
                      isConnected: false
                    });
                  }
                }
              });
            } else {
              wx.showToast({
                title: '该老人未绑定设备',
                icon: 'none',
                duration: 2000
              });
              this.setData({
                heartRate: '--',
                lastUpdateTime: '未绑定设备',
                isConnected: false
              });
            }
            return;
          }
          
          // 已绑定设备，初始化WebSocket连接
          this.initWebSocketConnection(elderlyId);
        } else {
          wx.showToast({
            title: '获取设备绑定状态失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('检查设备绑定状态失败:', error);
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 绑定设备
  bindDevice(elderlyId) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/health/bind`,
      method: 'POST',
      data: { elderlyId: elderlyId },
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        if (res.data.code === '200') {
          wx.showToast({
            title: '设备绑定成功',
            icon: 'success',
            duration: 2000
          });
          // 绑定成功后初始化WebSocket连接
          this.initWebSocketConnection(elderlyId);
        } else {
          wx.showToast({
            title: '设备绑定失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('设备绑定失败:', error);
        wx.showToast({
          title: '网络错误',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 初始化WebSocket连接
  initWebSocketConnection(elderlyId) {
    // 关闭之前的连接
    if (this.websocket) {
      try {
        this.websocket.close();
      } catch (error) {
        console.error('关闭WebSocket连接失败:', error);
      }
    }

    // 初始化WebSocket连接
    this.websocket = initWebSocket(
      elderlyId,
      (data) => {
        this.handleHealthData(data);
        this.setData({ isConnected: true });
      },
      () => {
        this.setData({ isConnected: false });
        // 只在连接断开且页面没有被卸载时重连
        if (!this.isUnloaded) {
          console.log('准备重新连接...');
          setTimeout(() => {
            this.reconnect(elderlyId);
          }, 5000);
        }
      }
    );
  },

  onUnload() {
    this.isUnloaded = true;
    // 清理重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.websocket) {
      try {
        this.websocket.close();
        this.websocket = null;
      } catch (error) {
        console.error('页面卸载时关闭WebSocket失败:', error);
      }
    }
  },

  reconnect(elderlyId) {
    if (this.isUnloaded) {
      return;
    }
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        this.initHealthMonitor(elderlyId);
        this.reconnectTimer = null;
      }, 5000);
    }
  },

  changeTimeRange(e) {
    const range = e.currentTarget.dataset.range;
    this.setData({ timeRange: range });
    // 重新加载对应时间范围的数据
    this.loadHistoryData(range);
  },

  loadHistoryData(range, elderlyId) {
    if (!chart) {
      console.warn('图表未初始化，无法加载历史数据');
      return;
    }

    // 如果没有传入elderlyId，使用当前选中的老人ID
    if (!elderlyId && this.data.elderlyList.length > 0) {
      elderlyId = this.data.elderlyList[this.data.selectedElderlyIndex].id;
    }

    if (!elderlyId) {
      console.warn('没有可用的老人ID');
      return;
    }

    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/health/history`,
      method: 'GET',
      data: { 
        elderlyId,
        range 
      },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200' && chart) {
          const historyData = res.data.data || [];
          
          // 转换数据格式
          const chartData = historyData.map(item => ({
            value: [new Date(item.timestamp), item.heartRate]
          }));

          this.setData({ 
            chartData,
            timeRange: range  // 更新时间范围
          });
          
          chart.setOption({
            series: [{
              data: chartData
            }]
          });

          if (historyData.length === 0) {
            wx.showToast({
              title: '暂无历史数据',
              icon: 'none'
            });
          }
        }
      },
      fail: (error) => {
        console.error('获取历史数据失败:', error);
        wx.showToast({
          title: '获取历史数据失败',
          icon: 'none'
        });
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

  formatTime(date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  },
}); 