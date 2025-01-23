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
    statusIndex: 0
  },

  lifetimes: {
    attached() {
      if (this.properties.formData.status) {
        const index = this.data.statusList.findIndex(s => s.value === this.properties.formData.status);
        this.setData({ statusIndex: index });
      }
    }
  },

  methods: {
    handleStartDateChange(e) {
      this.setData({
        'formData.startDate': e.detail.value
      });
    },

    handleStartTimeChange(e) {
      this.setData({
        'formData.startTime': e.detail.value
      });
    },

    handleEndDateChange(e) {
      this.setData({
        'formData.endDate': e.detail.value
      });
    },

    handleEndTimeChange(e) {
      this.setData({
        'formData.endTime': e.detail.value
      });
    },

    handleStatusChange(e) {
      this.setData({
        statusIndex: e.detail.value
      });
    },

    handleSubmit(e) {
      const formData = e.detail.value;
      // 将开始时间和结束时间格式化为 LocalDateTime 所需的格式
      formData.startTime = `${formData.startDate}T${formData.startTime}:00`;
      formData.endTime = `${formData.endDate}T${formData.endTime}:00`;
      
      // 时间比较逻辑
      const startDateTime = new Date(formData.startTime);
      const endDateTime = new Date(formData.endTime);
      if (startDateTime >= endDateTime) {
        wx.showToast({
          title: '结束时间必须晚于开始时间',
          icon: 'none'
        });
        return; // 终止提交
      }
      
      formData.activityStatus = this.data.statusList[this.data.statusIndex].value;
      formData.maxParticipants = parseInt(formData.maxParticipants) || null;
      
      this.triggerEvent('submit', formData);
    }
  }
}); 