// pages/settings.js

const app = getApp()

Page({
    data: {
        debug: true,
        isSetting: false,
        userInfo: {},
        deliveryInfo: {},
        hasUserInfo: false,
        hasDeliveryInfo: false
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
            wx.login({
                success: response => {
                    // 发送 res.code 到后台换取 openId, sessionKey, unionId
                    wx.request({
                        url: 'https://www.vicchen.club/signin',
                        data: { js_code: response.code, },
                        method: 'GET',
                        success: response => {
                            this.setData({
                                deliveryInfo: response.data,
                                hasDeliveryInfo: true
                            })
                            app.globalData.deliveryInfo = response.data
                        }
                    })
                }
            })
        }
    },

    start_set: function () {
        this.setData({ isSetting: true })
    },

    submit: function (e) {
        wx.showLoading({title: ' '})
        e.detail.value.openid = this.data.deliveryInfo.openid
        console.log(e.detail.value)
        wx.request({
            url: 'https://www.vicchen.club/upload_delivery_info',
            method: 'POST',
            data: e.detail.value,
            header: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            success: response => {
                if (response.data.upload_status == 'success') {
                    var new_deliveryInfo = Object.assign(this.data.deliveryInfo, e.detail.value)
                    this.setData({
                        deliveryInfo: new_deliveryInfo,
                        isSetting: false
                    })
                    wx.hideLoading()
                    wx.showToast({ title: '修改成功' })
                } else {
                    wx.showToast({ title: 'error: ' + response.data.errMsg, icon: 'none' , duration: 3000})
                }
            }
        })
    },


})