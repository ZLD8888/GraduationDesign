Component({
  properties: {
    formData: {
      type: Object,
      value: {}
    },
    submitText: {
      type: String,
      value: '提交'
    }
  },

  data: {
    statusList: [
      { label: '未开始', value: 'PLANNED' },
      { label: '进行中', value: 'ONGOING' },
      { label: '已结束', value: 'COMPLETED' },
      { label: '已取消', value: 'CANCELLED' }
    ],
    statusIndex: 0,
    hasChanged: false
  },

  lifetimes: {
    attached() {
      // 打印接收到的表单数据，用于调试
      console.log('Form data received:', this.properties.formData);
      
      // 检查activityStatus字段
      if (this.properties.formData.activityStatus) {
        const status = this.properties.formData.activityStatus;
        console.log('Current activity status:', status);
        
        const index = this.data.statusList.findIndex(s => s.value === status);
        console.log('Found status index:', index, 'for status:', status);
        
        if (index !== -1) {
          this.setData({ 
            statusIndex: index,
            ['formData.activityStatus']: status
          });
        }
      }
    }
  },

  observers: {
    'formData.activityStatus': function(status) {
      if (status) {
        const index = this.data.statusList.findIndex(s => s.value === status);
        if (index !== -1 && index !== this.data.statusIndex) {
          this.setData({ statusIndex: index });
        }
      }
    }
  },

  methods: {
    formatDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    },

    handleStartDateChange(e) {
      this.setData({
        'formData.startDate': e.detail.value,
        hasChanged: true
      });
    },

    handleStartTimeChange(e) {
      this.setData({
        'formData.startTime': e.detail.value,
        hasChanged: true
      });
    },

    handleEndDateChange(e) {
      this.setData({
        'formData.endDate': e.detail.value,
        hasChanged: true
      });
    },

    handleEndTimeChange(e) {
      this.setData({
        'formData.endTime': e.detail.value,
        hasChanged: true
      });
    },

    handleStatusChange(e) {
      const newIndex = parseInt(e.detail.value);
      const newStatus = this.data.statusList[newIndex].value;
      
      this.setData({
        statusIndex: newIndex,
        ['formData.activityStatus']: newStatus,
        hasChanged: true
      });
      
      console.log('Status changed to:', newStatus, 'index:', newIndex);
    },

    handleInputChange() {
      this.setData({
        hasChanged: true
      });
    },

    validateForm(formData) {
      if (!formData.name || formData.name.trim() === '') {
        wx.showToast({
          title: '请输入活动名称',
          icon: 'none'
        });
        return false;
      }

      if (!formData.startDate || !formData.startTime) {
        wx.showToast({
          title: '请选择开始时间',
          icon: 'none'
        });
        return false;
      }

      if (!formData.endDate || !formData.endTime) {
        wx.showToast({
          title: '请选择结束时间',
          icon: 'none'
        });
        return false;
      }

      if (!formData.location || formData.location.trim() === '') {
        wx.showToast({
          title: '请输入活动地点',
          icon: 'none'
        });
        return false;
      }

      return true;
    },

    handleSubmit(e) {
      const formData = e.detail.value;

      if (!this.data.hasChanged) {
        wx.showToast({
          title: '未做任何修改',
          icon: 'none'
        });
        return;
      }

      if (!this.validateForm(formData)) {
        return;
      }

      const startDate = formData.startDate.replace(/年|月/g, '-').replace(/日/g, '').split(' ')[0];
      const endDate = formData.endDate.replace(/年|月/g, '-').replace(/日/g, '').split(' ')[0];
      const startTime = formData.startTime.split(' ')[0];
      const endTime = formData.endTime.split(' ')[0];
      
      formData.startTime = `${startDate}T${startTime}:00`;
      formData.endTime = `${endDate}T${endTime}:00`;
      
      const startDateTime = new Date(formData.startTime);
      const endDateTime = new Date(formData.endTime);
      if (startDateTime >= endDateTime) {
        wx.showToast({
          title: '结束时间必须晚于开始时间',
          icon: 'none'
        });
        return;
      }
      
      // 使用当前选中的状态
      formData.activityStatus = this.data.statusList[this.data.statusIndex].value;
      console.log('Submitting with status:', formData.activityStatus);
      
      formData.maxParticipants = parseInt(formData.maxParticipants) || null;
      
      delete formData.startDate;
      delete formData.endDate;
      
      this.triggerEvent('submit', formData);
    }
  }
}); 