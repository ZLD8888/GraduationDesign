const app = getApp();

Page({
  data: {
    service: null,
    readonly: false,
    canBook: false,
    // 预约相关数据
    selectedDate: '',
    selectedTime: '', // 改为存储选择的具体时间
    availableDays: [], // 存储可预约日期
    maxAppointments: 0, // 每日最大预约次数
    remainingSlots: 0, // 当日剩余预约次数
    boundElderlyList: [],
    selectedElderly: '',
    isFamily: false,
    today: new Date().toISOString().split('T')[0],
    maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    startTime: '',
    endTime: '',
    timeList: [],
    appointedCount: 0
  },

  onLoad(options) {
    const { id, readonly, canBook } = options;
    const userRole = wx.getStorageSync('userRole');
    
    this.setData({
      readonly: readonly === 'true',
      canBook: canBook === 'true',
      isFamily: userRole === 'FAMILY',
      selectedTime: '', // 初始化选中的时间段
      timeSlots: [] // 初始化时间段列表
    });

    if (this.data.isFamily) {
      this.loadBoundElderly();
    }
    
    this.loadServiceDetail(id);
  },

  loadServiceDetail(id) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/services/${id}`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200') {
          const serviceData = res.data.data;
          // 处理可预约日期
          const availableDays = serviceData.availableDays ? serviceData.availableDays.split(',') : [];
          
          this.setData({
            service: serviceData,
            availableDays: availableDays,
            startTime: serviceData.startTime,
            endTime: serviceData.endTime
          });

          // 获取今天的日期并加载时间段
          const today = new Date().toISOString().split('T')[0];
          this.loadTimeSlots(today);
        }
      }
    });
  },

  // 加载绑定的老人列表
  loadBoundElderly() {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    wx.request({
      url: `${app.globalData.baseUrl}/api/services/family/${userId}/elderly`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.data) {
          this.setData({
            boundElderlyList: res.data.data
          });
        }
      }
    });
  },

  // 加载时间段
  loadTimeSlots(date) {
    const token = wx.getStorageSync('token');
    // 先获取当日已预约次数
    wx.request({
      url: `${app.globalData.baseUrl}/api/services/${this.data.service.id}/appointments/count`,
      method: 'GET',
      data: { 
        date: date
      },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (countRes) => {
        console.log('当日预约次数:', countRes.data);
        
        // 获取时间段信息
        wx.request({
          url: `${app.globalData.baseUrl}/api/services/${this.data.service.id}/timeslots`,
          method: 'GET',
          data: { date },
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            console.log('时间段接口返回数据:', res.data);
            
            if (res.data && res.data.data) {
              const timeSlotData = res.data.data[0] || {};
              console.log('处理后的时间段数据:', timeSlotData);
              
              // 使用服务的开始和结束时间
              const startTime = timeSlotData.startTime || this.data.service.startTime;
              const endTime = timeSlotData.endTime || this.data.service.endTime;
              
              // 计算剩余可预约次数
              const maxAppointments = timeSlotData.maxAppointments || this.data.service.maxAppointments || 0;
              const appointedCount = countRes.data.data || 0;
              const remainingSlots = Math.max(0, maxAppointments - appointedCount);
              
              // 生成时间段列表
              const timeList = remainingSlots > 0 ? 
                this.generateTimeSlots(startTime, endTime, 30) : [];
              
              this.setData({
                remainingSlots: remainingSlots,
                startTime: startTime,
                endTime: endTime,
                timeList: timeList,
                selectedTime: '',
                appointedCount: appointedCount,
                maxAppointments: maxAppointments
              });
              
              console.log('设置到页面的数据:', {
                startTime,
                endTime,
                timeList,
                remainingSlots,
                appointedCount,
                maxAppointments
              });
            }
          }
        });
      },
      fail: (error) => {
        console.error('获取预约次数失败:', error);
        wx.showToast({
          title: '加载预约信息失败',
          icon: 'none'
        });
      }
    });
  },

  // 生成时间段列表
  generateTimeSlots(startTime, endTime, intervalMinutes) {
    if (!startTime || !endTime) {
      console.log('缺少时间数据:', { startTime, endTime });
      return [];
    }

    const timeList = [];
    try {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      
      let currentHour = startHour;
      let currentMinute = startMinute;
      
      // 转换为分钟进行比较
      const endTotalMinutes = endHour * 60 + endMinute;
      
      while (currentHour * 60 + currentMinute < endTotalMinutes) {
        const timeString = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;
        timeList.push(timeString);
        
        currentMinute += intervalMinutes;
        if (currentMinute >= 60) {
          currentHour += Math.floor(currentMinute / 60);
          currentMinute = currentMinute % 60;
        }
      }
      
      console.log('生成的时间段列表:', timeList);
      return timeList;
    } catch (error) {
      console.error('生成时间段出错:', error);
      return [];
    }
  },

  // 处理日期选择
  handleDateChange(e) {
    const selectedDate = e.detail.value;
    
    // 检查选择的日期是否在可预约日期内
    const dayOfWeek = new Date(selectedDate).getDay().toString();
    if (!this.data.availableDays.includes(dayOfWeek)) {
      wx.showToast({
        title: '该日期不可预约',
        icon: 'none'
      });
      return;
    }

    this.setData({ selectedDate });
    // 加载选中日期的时间段信息
    this.loadTimeSlots(selectedDate);
  },

  // 处理时间段选择
  handleTimeSlotSelect(e) {
    const selectedSlot = e.currentTarget.dataset.slot;
    console.log('选中的时间段原始数据:', selectedSlot);

    if (!selectedSlot) {
      console.error('未获取到时间段数据');
      return;
    }

    if (selectedSlot.remainingSlots === 0) {
      wx.showToast({
        title: '该时间段已满',
        icon: 'none'
      });
      return;
    }

    // 直接使用固定的时间段 ID
    this.setData({
      selectedTime: selectedSlot.startTime
    }, () => {
      console.log('设置后的时间段ID:', this.data.selectedTime);
    });
  },

  // 处理老人选择
  handleElderlyChange(e) {
    const index = e.detail.value;
    this.setData({
      selectedElderly: index
    });
  },

  // 创建预约
  createAppointment() {
    if (!this.validateAppointmentData()) {
      return;
    }

    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');

    const appointmentData = {
      appointmentNo: `APPT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      serviceId: this.data.service.id,
      date: this.data.selectedDate,
      time: this.data.selectedTime,
      userId: userId,
      elderlyId: this.data.isFamily ? 
        this.data.boundElderlyList[this.data.selectedElderly].id : 
        userId
    };

    wx.request({
      url: `${app.globalData.baseUrl}/api/services/appointments`,
      method: 'POST',
      data: appointmentData,
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      success: (res) => {
        if (res.data.code === '200') {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.msg || '预约失败',
            icon: 'none'
          });
        }
      }
    });
  },

  validateAppointmentData() {
    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return false;
    }
    if (!this.data.selectedTime) {
      wx.showToast({
        title: '请选择时间段',
        icon: 'none'
      });
      return false;
    }
    if (this.data.isFamily && !this.data.selectedElderly) {
      wx.showToast({
        title: '请选择老人',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  handleBook() {
    const pages = getCurrentPages();
    const prevPage = pages[pages.length - 2];
    
    // 设置上一页的选中服务
    prevPage.setData({
      selectedService: this.data.service
    });
    
    wx.navigateBack({
      success: () => {
        // 返回后滚动到预约表单
        setTimeout(() => {
          wx.pageScrollTo({
            selector: '.booking-form',
            duration: 300
          });
        }, 300);
      }
    });
  },

  handleTimeSelect(e) {
    const selectedTime = e.currentTarget.dataset.time;
    console.log('选择的时间:', selectedTime);
    
    this.setData({
      selectedTime: selectedTime
    });
  }
}); 