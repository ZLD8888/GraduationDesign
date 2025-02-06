// 获取全局应用实例
const app = getApp();

Page({
  data: {
    userRole: '', // 用户角色
    isStaff: false, // 是否为员工
    isAdmin: false, // 是否为管理员
    isElderly: false, // 是否为老人
    isFamily: false, // 是否为家属
    appointments: [], // 预约列表
    selectedDate: '', // 选择的日期
    selectedTimeSlot: '', // 选择的时间段
    boundElderlyList: [], // 家属绑定的老人列表
    selectedElderly: '', // 家属选择的老人
    timeSlots: [], // 可预约的时间段
    services: [], // 服务列表
    selectedService: null, // 添加选中的服务
    // 添加状态映射
    statusMap: {
      'PENDING': '待确认',
      'CONFIRMED': '已确认',
      'COMPLETED': '已完成',
      'CANCELLED': '已取消'
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    // 检查用户角色
    this.checkUserRole();
    console.log('页面加载完成');
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 统一加载所有数据
    this.loadAllData();
  },

  /**
   * 检查用户角色并设置相应的标志位
   */
  checkUserRole() {
    // 从本地存储中获取用户角色
    const userRole = wx.getStorageSync('userRole');
    this.setData({
      userRole,
      isAdmin: userRole === 'ADMIN',
      isStaff: userRole === 'STAFF',
      isElderly: userRole === 'ELDERLY',
      isFamily: userRole === 'FAMILY'
    });

    // 如果是家属，加载绑定的老人列表
    if (this.data.isFamily) {
      this.loadBoundElderly();
    }
  },

  /**
   * 统一加载所有数据
   */
  loadAllData() {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 使用 Promise 处理异步加载
    Promise.all([
      new Promise((resolve, reject) => {
        this.loadServices(resolve, reject);
      }),
      new Promise((resolve, reject) => {
        this.loadAppointments(resolve, reject);
      })
    ]).finally(() => {
      wx.hideLoading();
    });
  },

  /**
   * 加载服务列表
   */
  loadServices(resolve, reject) {
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/services`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200') {
          console.log('加载到的服务列表：', res.data.data);
          this.setData({
            services: res.data.data || []
          });
          resolve && resolve();
        } else {
          wx.showToast({
            title: '加载服务列表失败',
            icon: 'none'
          });
          reject && reject(new Error('加载服务列表失败'));
        }
      },
      fail: (error) => {
        console.error('加载服务列表失败：', error);
        wx.showToast({
          title: '加载服务列表失败',
          icon: 'none'
        });
        reject && reject(error);
      }
    });
  },

  /**
   * 加载家属绑定的老人列表
   */
  loadBoundElderly() {
    // 从本地存储中获取token和用户ID
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

  /**
   * 加载指定服务和日期的可预约时间段
   * @param {number} serviceId - 服务ID
   * @param {string} date - 日期
   */
  loadTimeSlots(serviceId, date) {
    // 从本地存储中获取token
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/services/${serviceId}/timeslots`,
      method: 'GET',
      data: {
        date: date
      },
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.data) {
          this.setData({
            timeSlots: res.data.data
          });
        }
      }
    });
  },

  /**
   * 处理日期选择事件
   * @param {Object} e - 事件对象
   */
  handleDateChange(e) {
    // 获取选择的日期
    const date = e.detail.value;
    this.setData({ selectedDate: date });
    // 如果已选择服务，加载该服务在选择日期的可预约时间段
    if (this.data.selectedService) {
      this.loadTimeSlots(this.data.selectedService.id, date);
    }
  },

  /**
   * 处理老人选择事件
   * @param {Object} e - 事件对象
   */
  handleElderlyChange(e) {
    // 获取选择的老人ID
    const elderlyId = e.detail.value;
    this.setData({ selectedElderly: elderlyId });
  },

  /**
   * 处理时间段选择事件
   * @param {Object} e - 事件对象
   */
  handleTimeSlotChange(e) {
    // 获取选择的时间段ID
    const timeSlotId = e.detail.value;
    this.setData({ selectedTimeSlot: timeSlotId });
  },

  /**
   * 创建预约
   */
  createAppointment() {
    // 验证预约数据
    if (!this.validateAppointmentData()) {
      return;
    }

    // 构建预约数据
    const appointmentData = {
      serviceId: this.data.selectedService.id,
      date: this.data.selectedDate,
      timeSlotId: this.data.selectedTimeSlot,
      elderlyId: this.data.isFamily ? this.data.selectedElderly : wx.getStorageSync('userId')
    };

    // 从本地存储中获取token
    const token = wx.getStorageSync('token');
    wx.request({
      url: `${app.globalData.baseUrl}/api/services/appointments`,
      method: 'POST',
      data: appointmentData,
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data && res.data.success) {
          wx.showToast({
            title: '预约成功',
            icon: 'success'
          });
          // 重新加载预约列表
          this.loadAppointments();
        }
      }
    });
  },

  /**
   * 取消预约
   * @param {Object} e - 事件对象
   */
  cancelAppointment(e) {
    // 获取要取消的预约编号
    const appointmentNo = e.currentTarget.dataset.appointmentNo;
    console.log('要取消的预约编号:', appointmentNo);
    wx.showModal({
      title: '确认取消',
      content: '确定要取消这个预约吗？',
      success: (res) => {
        if (res.confirm) {
          // 从本地存储中获取token
          const token = wx.getStorageSync('token');
          
          // 显示加载提示
          wx.showLoading({
            title: '取消中...',
            mask: true
          });

          wx.request({
            url: `${app.globalData.baseUrl}/api/services/appointments/${appointmentNo}/cancel`,
            method: 'POST',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data && res.data.code === '200') {  // 确保检查正确的响应码
                // 先更新本地数据
                const updatedAppointments = this.data.appointments.map(item => {
                  if (item.appointmentNo === appointmentNo) {
                    return {
                      ...item,
                      status: 'CANCELLED',
                      statusText: this.data.statusMap['CANCELLED']
                    };
                  }
                  return item;
                });

                // 更新本地数据并重新排序
                this.setData({
                  appointments: updatedAppointments.sort((a, b) => {
                    // 定义状态优先级
                    const statusPriority = {
                      'CONFIRMED': 1,    // 已确认最优先
                      'PENDING': 2,      // 待确认次之
                      'COMPLETED': 3,    // 已完成再次
                      'CANCELLED': 4     // 已取消最后
                    };

                    // 获取状态优先级
                    const priorityA = statusPriority[a.status] || 999;
                    const priorityB = statusPriority[b.status] || 999;

                    // 首先按状态优先级排序
                    if (priorityA !== priorityB) {
                      return priorityA - priorityB;
                    }

                    // 如果状态相同，则按预约时间排序
                    const timeA = new Date(`${a.data} ${a.time}`);
                    const timeB = new Date(`${b.data} ${b.time}`);
                    return timeA - timeB;
                  })
                }, () => {
                  // 在数据更新完成后显示提示
                  wx.showToast({
                    title: '取消成功',
                    icon: 'success'
                  });
                });
              } else {
                wx.showToast({
                  title: res.data.msg || '取消失败',
                  icon: 'none'
                });
              }
            },
            fail: (error) => {
              console.error('取消预约失败：', error);
              wx.showToast({
                title: '取消失败',
                icon: 'none'
              });
            },
            complete: () => {
              wx.hideLoading();
            }
          });
        }
      }
    });
  },

  /**
   * 验证预约数据
   * @return {boolean} - 验证结果
   */
  validateAppointmentData() {
    // 验证日期是否选择
    if (!this.data.selectedDate) {
      wx.showToast({
        title: '请选择日期',
        icon: 'none'
      });
      return false;
    }
    // 验证时间段是否选择
    if (!this.data.selectedTimeSlot) {
      wx.showToast({
        title: '请选择时间段',
        icon: 'none'
      });
      return false;
    }
    // 如果是家属，验证是否选择老人
    if (this.data.isFamily && !this.data.selectedElderly) {
      wx.showToast({
        title: '请选择老人',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  goToDetail(e) {
    const appointmentId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/appointment/detail/index?id=${appointmentId}`
    });
  },

  goToServiceSettings() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '无权限访问',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/appointment/settings/index'
    });
  },

  /**
   * 加载预约列表
   */
  loadAppointments(successCallback, failCallback) {
    const token = wx.getStorageSync('token');
    const userId = wx.getStorageSync('userId');
    
    let url;
    if (this.data.isAdmin) {
        url = `${app.globalData.baseUrl}/api/services/appointments`;
    } else if (this.data.isStaff) {
        url = `${app.globalData.baseUrl}/api/services/staff/${userId}/appointments`;
    } else if (this.data.isElderly) {
        url = `${app.globalData.baseUrl}/api/services/elderly/${userId}/appointments`;
    } else if (this.data.isFamily) {
        url = `${app.globalData.baseUrl}/api/services/family/${userId}/appointments`;
    }

    wx.request({
        url: url,
        method: 'GET',
        header: {
            'Authorization': `Bearer ${token}`
        },
        success: (res) => {
            if (res.data && res.data.data) {
                let appointments = res.data.data.map(item => ({
                    appointmentNo: item.appointmentNo,
                    serviceName: item.serviceName,
                    elderlyName: item.elderlyName,
                    userName: item.userName,
                    price: item.price,
                    data: item.data,
                    time: item.time,
                    status: item.status,
                    createTime: item.createTime,
                    statusText: this.data.statusMap[item.status] || item.status,
                    imageUrl: item.imageUrl,
                    appointmentTime: `${item.data} ${item.time}`
                }));

                // 修改排序逻辑
                appointments.sort((a, b) => {
                    // 定义状态优先级
                    const statusPriority = {
                        'CONFIRMED': 1,    // 已确认最优先
                        'PENDING': 2,      // 待确认次之
                        'COMPLETED': 3,    // 已完成再次
                        'CANCELLED': 4     // 已取消最后
                    };

                    // 获取状态优先级，如果状态不存在则赋予最低优先级
                    const priorityA = statusPriority[a.status] || 999;
                    const priorityB = statusPriority[b.status] || 999;

                    // 首先按状态优先级排序
                    if (priorityA !== priorityB) {
                        return priorityA - priorityB;
                    }

                    // 如果状态相同，则按预约时间排序
                    const timeA = new Date(`${a.data} ${a.time}`);
                    const timeB = new Date(`${b.data} ${b.time}`);
                    return timeA - timeB;
                });

                console.log('排序后的预约列表:', appointments);
                this.setData({ 
                    appointments 
                }, () => {
                    if (successCallback) {
                        successCallback();
                    }
                });
            } else {
                if (failCallback) {
                    failCallback(new Error('加载预约列表失败'));
                }
            }
        },
        fail: (error) => {
            console.error('加载预约列表失败：', error);
            if (failCallback) {
                failCallback(error);
            }
        }
    });
  },

  // 处理服务点击事件
  handleServiceTap(e) {
    const serviceId = e.currentTarget.dataset.id;
    console.log('服务ID:', serviceId);

    if (this.data.isAdmin) {
      // 管理员点击进入编辑页面
      wx.navigateTo({
        url: `/pages/appointment/settings/index?id=${serviceId}`
      });
    } else if (this.data.isStaff) {
      // 工作人员只能查看详情
      wx.navigateTo({
        url: `/pages/appointment/serviceDetail/service?id=${serviceId}&readonly=true`
      });
    } else {
      // 老人或家属先查看详情，然后可以选择预约
      wx.navigateTo({
        url: `/pages/appointment/serviceDetail/service?id=${serviceId}&canBook=true`
      });
    }
  },
}); 