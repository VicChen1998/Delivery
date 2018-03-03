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
        app.globalData.isModifying = true
        app.globalData.modifying_order = this.data.order

        wx.switchTab({
            url: '/pages/order/order',
        })
    },

    cancel: function (e) {
        wx.showModal({
            title: 'QAQ',
            content: '你确定要退单吗？',
            confirmText: '是的',
            confirmColor: '#FF0000',
            cancelText: '绝不！！',
            success: response => {
                if (response.confirm) {
                    wx.request({
                        url: app.globalData.host + 'cancel',
                        method: 'POST',
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        data: {
                            'openid': app.globalData.userAddress.openid,
                            'order_id': this.data.order.id
                        },
                        success: response => {
                            if (response.data.status == 'success') {
                                wx.showToast({ title: '已退单' })
                                setTimeout(function () {
                                    wx.navigateBack()
                                }, 1500)
                            }
                        }
                    })
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
            data: {
                'openid': app.globalData.userAddress.openid,
                'order_id': this.data.order.id
            },
            success: response => {
                if (response.data.status == 'success') {
                    this.data.order.status = 13
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