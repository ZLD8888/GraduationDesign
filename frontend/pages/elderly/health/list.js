const app = getApp();
const echarts = require('../../../ec-canvas/echarts');

Page({
  data: {
    elderlyId: null,
    startDate: '',
    endDate: '',
    records: [],
    isStaff: false,
    ec: {
      lazyLoad: true
    }
  },

  onLoad(options) {
    this.setData({
      elderlyId: options.elderlyId
    });
    this.checkUserRole();
    this.loadHealthRecords();
    this.initChart();
  },

  checkUserRole() {
    const userRole = wx.getStorageSync('userRole');
    this.setData({
      isStaff: userRole === 'STAFF'
    });
  },

  handleStartDateChange(e) {
    this.setData({
      startDate: e.detail.value
    });
  },

  handleEndDateChange(e) {
    this.setData({
      endDate: e.detail.value
    });
  },

  handleSearch() {
    this.loadHealthRecords();
  },

  loadHealthRecords() {
    const token = wx.getStorageSync('token');
    let url = `${app.globalData.baseUrl}/api/health-records/elderly/${this.data.elderlyId}`;
    
    if (this.data.startDate && this.data.endDate) {
      url += `/range?startTime=${this.data.startDate}&endTime=${this.data.endDate}`;
    }

    wx.request({
      url,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        this.setData({
          records: res.data
        });
        this.updateChart();
      }
    });
  },

  initChart() {
    this.ecComponent = this.selectComponent('#healthChart');
    this.ecComponent.init((canvas, width, height, dpr) => {
      const chart = echarts.init(canvas, null, {
        width: width,
        height: height,
        devicePixelRatio: dpr
      });
      this.chart = chart;
      return chart;
    });
  },

  updateChart() {
    const option = {
      title: {
        text: '健康数据趋势'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['体温', '心率']
      },
      xAxis: {
        type: 'category',
        data: this.data.records.map(r => r.recordTime)
      },
      yAxis: [
        {
          type: 'value',
          name: '体温',
          min: 35,
          max: 42
        },
        {
          type: 'value',
          name: '心率',
          min: 40,
          max: 120
        }
      ],
      series: [
        {
          name: '体温',
          type: 'line',
          data: this.data.records.map(r => r.temperature)
        },
        {
          name: '心率',
          type: 'line',
          yAxisIndex: 1,
          data: this.data.records.map(r => r.heartRate)
        }
      ]
    };
    this.chart.setOption(option);
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/elderly/health/detail?id=${id}`
    });
  },

  goToAdd() {
    wx.navigateTo({
      url: `/pages/elderly/health/add?elderlyId=${this.data.elderlyId}`
    });
  }
}); 