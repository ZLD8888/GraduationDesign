const app = getApp()

Page({
  data: {
    year: new Date().getFullYear(), // 当前年份
    month: new Date().getMonth(), // 当前月份
    weekdays: ['日', '一', '二', '三', '四', '五', '六'], // 星期数组
    days: [], // 存储日历中的天数
    activities: [], // 存储活动数据
    selectedDate: '', // 选中的日期
    selectedActivities: [] // 选中日期的活动
  },

  onLoad() {
    this.initCalendar(); // 初始化日历
    this.loadMonthActivities(); // 加载当前月份的活动
  },

  initCalendar() {
    const days = [];
    const date = new Date(this.data.year, this.data.month, 1); // 当前月的第一天
    const lastDay = new Date(this.data.year, this.data.month + 1, 0).getDate(); // 当前月的最后一天
    const firstDayWeek = date.getDay(); // 当前月第一天是星期几

    // 上个月的最后几天
    const prevMonthLastDay = new Date(this.data.year, this.data.month, 0).getDate();
    for (let i = firstDayWeek - 1; i >= 0; i--) {
      days.push({
        day: prevMonthLastDay - i,
        date: `${this.data.year}-${this.data.month.toString().padStart(2, '0')}-${(prevMonthLastDay - i).toString().padStart(2, '0')}`,
        isCurrentMonth: false, // 标记是否为当前月
        hasActivity: false // 标记是否有活动
      });
    }

    // 当前月的天数
    for (let i = 1; i <= lastDay; i++) {
      days.push({
        day: i,
        date: `${this.data.year}-${(this.data.month + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
        isCurrentMonth: true,
        hasActivity: false
      });
    }

    // 下个月的开始几天
    const remainingDays = 42 - days.length; // 保持6行
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        day: i,
        date: `${this.data.year}-${(this.data.month + 2).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`,
        isCurrentMonth: false,
        hasActivity: false
      });
    }

    this.setData({ days }); // 更新页面数据
  },

  loadMonthActivities() {
    const startDate = new Date(this.data.year, this.data.month, 1); // 当前月的第一天
    const endDate = new Date(this.data.year, this.data.month + 1, 0); // 当前月的最后一天
    console.log('请求的时间范围:', {
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0]
    });
    const token = wx.getStorageSync('token'); // 获取token

    wx.request({
      url: `${app.globalData.baseUrl}/api/activity/range`, // 请求活动范围的API
      method: 'GET',
      header: {
        'Authorization': `Bearer ${token}`
      },
      data: {
        startDate: startDate.toISOString().split('T')[0], // 只传递日期部分
        endDate: endDate.toISOString().split('T')[0]
      },
      success: (res) => {
        console.log('请求参数:', {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        });
        console.log("返回的数据", res.data.data); // 输出返回的数据
        this.setData({ activities: res.data.data }); // 更新活动数据
        this.updateCalendarActivities(); // 更新日历活动状态
      }
    });
  },

  updateCalendarActivities() {
    const days = this.data.days.map(day => {
      const hasActivity = this.data.activities.some(activity => {
        const activityDate = activity.startTime.split('T')[0]; // 获取活动日期
        console.log('活动日期:', activityDate);
        return activityDate === day.date; // 检查活动日期是否与日历日期匹配
      });
      return { ...day, hasActivity }; // 更新天数数据
    });
    console.log('更新后的天数:', days);
    this.setData({ days }); // 更新页面数据
  },

  prevMonth() {
    let { year, month } = this.data;
    if (month === 0) {
      year--; // 如果是1月，年份减1
      month = 11; // 月份设为12月
    } else {
      month--; // 否则月份减1
    }
    this.setData({ year, month }, () => {
      this.initCalendar(); // 重新初始化日历
      this.loadMonthActivities(); // 加载活动
    });
  },

  nextMonth() {
    let { year, month } = this.data;
    if (month === 11) {
      year++; // 如果是12月，年份加1
      month = 0; // 月份设为1月
    } else {
      month++; // 否则月份加1
    }
    this.setData({ year, month }, () => {
      this.initCalendar(); // 重新初始化日历
      this.loadMonthActivities(); // 加载活动
    });
  },

  showDayActivities(e) {
    const date = e.currentTarget.dataset.date; // 获取点击的日期
    console.log('选择的日期:', date);
    const activities = this.data.activities.filter(activity => 
        activity.startTime.split('T')[0] === date // 过滤出该日期的活动
    );

    // 格式化活动时间
    const formattedActivities = activities.map(activity => ({
        ...activity,
        startTime: this.formatDateTime(activity.startTime),
        endTime: this.formatDateTime(activity.endTime)
    }));

    console.log('活动:', formattedActivities);
    this.setData({
        selectedDate: date,
        selectedActivities: formattedActivities // 更新选中日期的活动
    });
  },

  goToDetail(e) {
    const id = e.currentTarget.dataset.id; // 获取活动ID
    wx.navigateTo({
      url: `/pages/elderly/activities/detail?id=${id}` // 跳转到活动详情页
    });
  },

  formatDateTime(dateTime) {
    const date = new Date(dateTime);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // 月份从0开始
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  }
});