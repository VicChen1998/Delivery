// pages/pay/pay.js
const app = getApp()

Page({

    data: {
        qrcode_wx_src: '',
        qrcode_alipay_src: ''
    },

    onLoad: function (options) {
        this.setData({
            qrcode_wx_src: app.globalData.host + 'get_pay_qrcode?campus_id=' + app.globalData.userAddress.campus.id + '&method=wx',
            qrcode_alipay_src: app.globalData.host + 'get_pay_qrcode?campus_id=' + app.globalData.userAddress.campus.id + '&method=alipay',
        })
    },

    save: function (e) {
        wx.downloadFile({
            url: app.globalData.host + 'resource?name=' + e.target.dataset.filename,
            success: download_res => {
                wx.authorize({
                    scope: 'scope.writePhotosAlbum',
                    success: auth_res => {
                        wx.saveImageToPhotosAlbum({
                            filePath: download_res.tempFilePath,
                            success: save_res => { wx.showToast({ title: '已保存到手机', icon: 'none' }) },
                            fail: save_res => { wx.showToast({ title: '保存失败', icon: 'none' }) }
                        })

                    },
                    fail: auth_res => {
                        wx.showModal({
                            title: '未开启授权',
                            content: '请自行截图二维码进行付款。或从右上角->关于->右上角->设置中开启授权',
                            showCancel: false,
                        })
                    }
                })

            }
        })


    }
})