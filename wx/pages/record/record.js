// pages/history.js
const app = getApp()

Page({

    data: {
        userInfo: {},
        deliveryInfo: {},
        hasUserInfo: false,
        hasDeliveryInfo: false,

        finish_get_order: false,
        hasOrder: false,
        order_count: 0,
        order_list: {},
    },

    clear: function () {
        this.setData({
            hasOrder: false,
            order_count: 0,
            order_list: {}
        })
    },

    onLoad: function (options) {
        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })
        }

        if (app.globalData.deliveryInfo) {
            this.setData({
                deliveryInfo: app.globalData.deliveryInfo,
                hasDeliveryInfo: true
            })
        } else {
            // 登录
            wx.login({
                success: response => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    wx.request({
                        url: 'https://www.vicchen.club/signin',
                        data: { js_code: response.code, },
                        method: 'GET',
                        success: response => {
                            if (response.data.signin_status == 'success') {
                                this.setData({
                                    deliveryInfo: response.data,
                                    hasDeliveryInfo: true
                                })
                                app.globalData.deliveryInfo = response.data
                            } else {
                                wx.showToast({
                                    title: 'login fail:' + response.data.errMsg,
                                    icon: 'none'
                                })
                            }

                        }
                    })
                }
            })
        }

    },

    onShow: function () {
        this.get_order()
    },

    onPullDownRefresh: function () {
        this.get_order()
    },

    get_order: function () {
        wx.showNavigationBarLoading()
        wx.request({
            url: 'https://www.vicchen.club/get_order',
            data: { 'openid': this.data.deliveryInfo.openid },
            success: response => {
                if (response.data.get_order_status == 'success') {
                    this.setData({
                        order_list: response.data.order_list,
                        order_count: response.data.order_count,
                        hasOrder: true
                    })
                }
            },
            complete: response => {
                this.setData({ finish_get_order: true })
                wx.stopPullDownRefresh()
                wx.hideNavigationBarLoading()
            }
        })
    },
})