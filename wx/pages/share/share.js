// pages/share/share.js
const app = getApp()

Page({

    data: {
        qrcode_src: null,
        isShareQrcodeInTest: false,
    },

    onLoad: function (options) {

        wx.setNavigationBarTitle({title: '分享'})

        this.setData({
            qrcode_src: app.globalData.host + 'get_share_qrcode?openid=' + app.globalData.userAddress.openid
        })

        app.globalData.hasOpenSharePage = true
    },

    to_invite_record: function () {
        wx.navigateTo({
            url: '/pages/share/invite_record',
        })
    },

    onShareAppMessage: app.onShareAppMessage
})