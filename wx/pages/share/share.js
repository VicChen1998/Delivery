// pages/share/share.js
const app = getApp()

Page({

    data: {
        qrcode_src: null,
        isShareQrcodeInTest: false,
    },

    onLoad: function (options) {

        this.setData({
            qrcode_src: app.globalData.host + 'get_share_qrcode?openid=' + app.globalData.userAddress.openid
        })

        wx.request({
            url: app.globalData.host + 'get_status',
            data: { 'key': 'isShareQrcodeInTest' },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({ isShareQrcodeInTest: response.data.value })
                } else {
                    wx.showToast({ title: 'error' + response.data.errMsg })
                }
            }
        })

        app.globalData.hasOpenSharePage = true
    },

    to_invite_record: function () {
        wx.navigateTo({
            url: '/pages/share/invite_record',
        })
    },

    onShareAppMessage: function (options) {
        return { path: '/pages/order/order?inviter=' + app.globalData.userAddress.openid }
    }
})