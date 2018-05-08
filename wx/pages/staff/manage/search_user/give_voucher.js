// pages/staff/manage/search_user/give_voucher.js
const app = getApp()

Page({

    data: {
        user_openid: null,
        name: '',
    },

    onLoad: function (options) {
        this.setData({
            user_openid: options.user_openid,
            name: options.name
        })
        wx.setNavigationBarTitle({ title: '发放优惠券' })
    },

    give_voucher: function (e) {
        wx.request({
            url: app.globalData.host + 'give_voucher',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
                'openid': app.globalData.userAddress.openid,
                'user_openid': this.data.user_openid,
                'value': e.detail.value.value,
                'period': e.detail.value.period
            },
            success: response => {
                wx.showToast({ title: '发放成功' })
                setTimeout(function () {
                    wx.navigateBack({})
                }, 1500)
            }
        })
    }
})