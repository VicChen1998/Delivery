// pages/record/detail/detail.js
const app = getApp()

Page({

    data: {
        order: {}
    },

    onLoad: function (options) {
        if (app.globalData.order)
            this.setData({
                order: app.globalData.order
            })
    },

    modify: function (e) {
        wx.showToast({
            title: '还没写',
        })
    },

    cancel: function (e) {
        wx.request({
            url: app.globalData.host + 'cancel',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { 'order_id': this.data.order.id },
            success: response => {
                if (response.data.status == 'success') {
                    wx.showToast({ title: '已取消' })
                    setTimeout(function () {
                        wx.navigateBack()
                    }, 1500)
                }
            }
        })
    },

    press: function (e) {
        wx.showToast({
            title: '急什么，等着！',
        })
    },

    receive: function (e) {
        wx.request({
            url: app.globalData.host + 'receive',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: { 'order_id': this.data.order.id },
            success: response => {
                if (response.data.status == 'success') {
                    this.data.order.status = 3
                    this.data.order.status_describe = '已完成'
                    this.setData({ order: this.data.order })
                    wx.showToast({
                        title: '开箱愉快！',
                    })
                }
            }
        })
    },

    after_sale: function (e) {
        wx.showToast({
            title: '不存在的(划掉)',
        })
    },
})