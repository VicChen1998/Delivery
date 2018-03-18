// pages/pay/pay.js
const app = getApp()

Page({

    data: {
        order_id: '',
        showPayButton: false,
    },

    onLoad: function (options) {
        this.setData({ order_id: app.globalData.paying_order_id })
        var t = this
        setTimeout(function () {
            t.setData({ showPayButton: true })
        }, 2000)
    },

    has_pay: function (e){
        wx.request({
            url: app.globalData.host + 'pay',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
                'openid': app.globalData.userAddress.openid,
                'order_id': this.data.order_id,
            },
            success: response => {
                wx.navigateBack({
                    delta: 2
                })
                wx.showToast({
                    title: '等待确认',
                })
            }
        })
    },

    save: function (e) {
        console.log(e)
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