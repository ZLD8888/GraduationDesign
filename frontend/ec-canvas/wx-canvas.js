class WxCanvas {
  constructor(ctx, canvasId, isNew, canvasNode) {
    this.ctx = ctx;
    this.canvasId = canvasId;
    this.chart = null;
    this.isNew = isNew;
    if (isNew) {
      this.canvasNode = canvasNode;
    }
    this._initEvent();
  }

  _initEvent() {
    this.event = {};
    const eventNames = [
      'click', 'dblclick', 'mousewheel', 'mouseout',
      'mouseup', 'mousedown', 'mousemove', 'contextmenu'
    ];
    eventNames.forEach(name => {
      this.event[name] = {
        listeners: []
      };
    });
  }

  addEventListener(type, listener) {
    if (this.event[type]) {
      this.event[type].listeners.push(listener);
    }
  }

  removeEventListener(type, listener) {
    if (this.event[type]) {
      const index = this.event[type].listeners.indexOf(listener);
      if (index > -1) {
        this.event[type].listeners.splice(index, 1);
      }
    }
  }

  dispatchEvent(type, event) {
    if (this.event[type]) {
      this.event[type].listeners.forEach(listener => {
        listener(event);
      });
    }
  }

  getContext(contextType) {
    if (contextType === '2d') {
      return this.ctx;
    }
  }

  // 设置图表实例
  setChart(chart) {
    this.chart = chart;
  }

  attachEvent() {
    // noop
  }

  detachEvent() {
    // noop
  }

  measureText(text, font) {
    if (this.isNew) {
      return this.ctx.measureText(text);
    } else {
      const measureCtx = wx.createCanvasContext('measure-text', this);
      measureCtx.font = font || '12px sans-serif';
      return measureCtx.measureText(text);
    }
  }
}

module.exports = WxCanvas; 