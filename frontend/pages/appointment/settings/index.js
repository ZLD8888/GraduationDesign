const app = getApp();

Page({
  data: {
    services: [],
    isEditing: false,
    currentService: {
      name: '',
      description: '',
      price: '',
      imageUrl: '',
      status: 'ACTIVE',
      startTime: '',
      endTime: '',
      maxAppointments: '',
      availableDays: ''  // 初始为空
    },
    timeSlots: [],
    days: [
      { value: '1', label: '周一' },
      { value: '2', label: '周二' },
      { value: '3', label: '周三' },
      { value: '4', label: '周四' },
      { value: '5', label: '周五' },
      { value: '6', label: '周六' },
      { value: '7', label: '周日' }
    ]
  },

  onLoad(options) {
    // 如果传入了ID，说明是编辑模式
    if (options && options.id) {
      this.loadServiceDetail(options.id);
    }
    this.loadServices();
  },

  onShow() {
    this.loadServices();
  },

  loadServices() {
    const token = wx.getStorageSync('token');
    // 显示加载中
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    wx.request({
      url: `${app.globalData.baseUrl}/api/services`,
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      success: (res) => {
        if (res.data.code === '200') {
          this.setData({
            services: res.data.data || []
          });
        } else {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('加载服务列表失败：', error);
        wx.showToast({
          title: '加载失败',
          icon: 'none'
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
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
        if (res.data.code === '200' && res.data.data) {
          const service = res.data.data;
          // 确保 availableDays 是字符串格式，如果是 null 则设为空字符串
          if (service.availableDays === null || service.availableDays === undefined) {
            service.availableDays = '';
          }
          // 直接将 availableDays 转换为字符串
          service.availableDays = String(service.availableDays);
          
          // 预处理每个日期的选中状态
          const daysArray = service.availableDays.split(',');
          const days = this.data.days.map(day => ({
            ...day,
            checked: daysArray.includes(day.value)
          }));
          
          console.log('原始服务数据:', service);
          console.log('处理后的 availableDays:', service.availableDays);
          this.setData({
            isEditing: true,
            currentService: service,
            days: days
          });
        } else {
          wx.showToast({
            title: '加载服务详情失败',
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error('加载服务详情失败：', error);
        wx.showToast({
          title: '加载服务详情失败',
          icon: 'none'
        });
      }
    });
  },

  handleAddService() {
    this.setData({
      isEditing: true,
      currentService: {
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        status: 'ACTIVE',
        startTime: '',
        endTime: '',
        maxAppointments: '',
        availableDays: ''
      }
    });
  },

  handleEditService(e) {
    const serviceId = e.currentTarget.dataset.id;
    const service = this.data.services.find(s => s.id === serviceId);
    this.setData({
      isEditing: true,
      currentService: { 
        ...service,
        id: serviceId  // 确保 ID 被正确传递
      }
    });
  },

  handleSaveService() {
    if (!this.validateServiceData()) {
      return;
    }

    if (!this.validateTimeSlots()) {
      return;
    }

    const token = wx.getStorageSync('token');
    const isEdit = !!this.data.currentService.id;
    
    const url = isEdit 
      ? `${app.globalData.baseUrl}/api/services/${this.data.currentService.id}`
      : `${app.globalData.baseUrl}/api/services`;

    wx.request({
      url: url,
      method: isEdit ? 'PUT' : 'POST',
      header: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      data: this.data.currentService,
      success: (res) => {
        if (res.data.code === '200') {
          wx.showToast({
            title: isEdit ? '更新成功' : '添加成功',
            icon: 'success',
            duration: 2000
          });
          
          this.loadServices();
          
          this.setData({
            isEditing: false,
            currentService: null
          });
        } else {
          wx.showToast({
            title: res.data.msg || (isEdit ? '更新失败' : '添加失败'),
            icon: 'none'
          });
        }
      },
      fail: (error) => {
        console.error(isEdit ? '更新服务失败：' : '添加服务失败：', error);
        wx.showToast({
          title: isEdit ? '更新失败' : '添加失败',
          icon: 'none'
        });
      }
    });
  },

  handleDeleteService(e) {
    const serviceId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个服务吗？',
      success: (res) => {
        if (res.confirm) {
          const token = wx.getStorageSync('token');
          // 显示删除中的加载提示
          wx.showLoading({
            title: '删除中...',
            mask: true
          });
          
          wx.request({
            url: `${app.globalData.baseUrl}/api/services/${serviceId}`,
            method: 'DELETE',
            header: {
              'Authorization': `Bearer ${token}`
            },
            success: (res) => {
              if (res.data.code === '200') {
                // 先从本地数据中移除被删除的服务
                const updatedServices = this.data.services.filter(
                  service => service.id !== serviceId
                );
                this.setData({
                  services: updatedServices
                });
                
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 2000
                });
                
                // 延迟重新加载服务列表，确保后端数据已更新
                setTimeout(() => {
                  this.loadServices();
                }, 500);
              } else {
                wx.showToast({
                  title: res.data.msg || '删除失败',
                  icon: 'none'
                });
              }
            },
            fail: (error) => {
              console.error('删除服务失败：', error);
              wx.showToast({
                title: '删除失败',
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

  validateServiceData() {
    const { name, price } = this.data.currentService;
    if (!name) {
      wx.showToast({
        title: '请输入服务名称',
        icon: 'none'
      });
      return false;
    }
    if (!price || isNaN(price)) {
      wx.showToast({
        title: '请输入有效的价格',
        icon: 'none'
      });
      return false;
    }
    return true;
  },

  handleInputChange(e) {
    const { field } = e.currentTarget.dataset;
    this.setData({
      [`currentService.${field}`]: e.detail.value
    });
  },

  handleCancel() {
    this.setData({
      isEditing: false,
      currentService: null
    });
  },

  handleUploadImage() {
    wx.chooseImage({
      count: 1,
      success: (res) => {
        console.log('选择的临时文件路径：', res.tempFilePaths[0]);
        const tempFilePath = res.tempFilePaths[0];
        const token = wx.getStorageSync('token');
        wx.uploadFile({
          url: `${app.globalData.baseUrl}/api/services/upload`,
          filePath: tempFilePath,
          name: 'file',
          header: {
            'Authorization': `Bearer ${token}`
          },
          success: (res) => {
            let data;
            try {
              data = JSON.parse(res.data);
              console.log('上传返回数据：', data);
            } catch (e) {
              console.error('解析返回数据失败：', e);
              return;
            }

            if (data.code === '200' && data.data) {
              const url = data.data;
              console.log('准备设置的图片URL:', url);
              
              // 验证URL格式
              if (!url.startsWith('https://') || url.includes('https://https://')) {
                console.error('无效的URL格式:', url);
                wx.showToast({
                  title: 'URL格式错误',
                  icon: 'none'
                });
                return;
              }

              // 预先检查图片是否可访问
              wx.getImageInfo({
                src: url,
                success: (res) => {
                  console.log('图片信息：', res);
                  this.setData({
                    'currentService.imageUrl': url
                  });
                  wx.showToast({
                    title: '上传成功',
                    icon: 'success'
                  });
                },
                fail: (error) => {
                  console.error('图片访问失败：', error);
                  wx.showToast({
                    title: '图片无法访问',
                    icon: 'none'
                  });
                }
              });
            } else {
              wx.showToast({
                title: data.msg || '上传失败',
                icon: 'none'
              });
            }
          }
        });
      }
    });
  },

  handleImageError(e) {
    console.error('图片加载失败：', e);
    console.error('失败的图片URL：', this.data.currentService.imageUrl);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none'
    });
    // 打印详细的错误信息
    if (e.detail && e.detail.errMsg) {
      console.error('错误详情：', e.detail.errMsg);
    }
    this.setData({
      'currentService.imageUrl': ''
    });
  },

  handleTimeSlotChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    // 如果是结束时间，验证是否晚于开始时间
    if (field === 'endTime' && this.data.currentService.startTime) {
      const startMinutes = this.timeToMinutes(this.data.currentService.startTime);
      const endMinutes = this.timeToMinutes(value);
      
      if (endMinutes <= startMinutes) {
        wx.showToast({
          title: '结束时间必须晚于开始时间',
          icon: 'none'
        });
        return;
      }
    }
    
    this.setData({
      [`currentService.${field}`]: value
    });
  },

  // 将时间转换为分钟数，用于比较
  timeToMinutes(time) {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  },

  handleDaysChange(e) {
    const selectedDays = e.detail.value;
    // 只有当有选择时才设置值
    if (selectedDays && selectedDays.length > 0) {
      const daysString = selectedDays.sort().join(',');
      console.log('选中的日期:', selectedDays, '转换后的字符串:', daysString); // 调试用
      this.setData({
        'currentService.availableDays': daysString
      });
      // 强制更新视图
      this.setData({
        currentService: { ...this.data.currentService }
      });
    } else {
      this.setData({
        'currentService.availableDays': ''
      });
    }
  },

  // 检查某天是否被选中
  isDayChecked(value) {
    // 获取当前的可用日期字符串
    const availableDays = this.data.currentService.availableDays || '';
    console.log('当前的 availableDays:', availableDays);

    // 将传入的 value 转换为字符串
    const checkValue = value.toString();
    console.log('检查的日期值:', checkValue);

    // 如果 availableDays 为空，直接返回 false
    if (!availableDays) {
      console.log('availableDays 为空，返回 false');
      return false;
    }

    // 将可用日期字符串转换为数组
    const daysArray = availableDays.split(',');
    console.log('可用日期数组:', daysArray);

    // 检查是否包含当前值
    const result = daysArray.indexOf(checkValue) !== -1;
    console.log(`日期 ${checkValue} 是否被选中:`, result);

    return result;
  },

  validateTimeSlots() {
    const { startTime, endTime, maxAppointments, availableDays } = this.data.currentService;
    
    if (!startTime || !endTime || !maxAppointments) {
      wx.showToast({
        title: '请完整填写时间段信息',
        icon: 'none'
      });
      return false;
    }

    // 验证结束时间是否晚于开始时间
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    if (endMinutes <= startMinutes) {
      wx.showToast({
        title: '结束时间必须晚于开始时间',
        icon: 'none'
      });
      return false;
    }

    // 验证名额数是否为正整数
    if (!/^\d+$/.test(maxAppointments) || parseInt(maxAppointments) <= 0) {
      wx.showToast({
        title: '名额数必须为正整数',
        icon: 'none'
      });
      return false;
    }
    
    // 验证是否选择了可预约日期
    if (!availableDays || availableDays === '') {
      wx.showToast({
        title: '请选择可预约日期',
        icon: 'none'
      });
      return false;
    }
    
    return true;
  }
}); 