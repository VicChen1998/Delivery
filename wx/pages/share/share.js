// pages/share/share.js
const app = getApp()

Page({

    data: {
        qrcode_src: null,
    },

    onLoad: function (options) {
        this.setData({
            qrcode_src: app.globalData.host + 'get_share_qrcode?openid=' + app.globalData.userAddress.openid
        })
    },

    to_invite_record: function(){
        wx.navigateTo({
            url: '/pages/share/invite_record',
        })
    },

    onShareAppMessage: function () {

    }
})