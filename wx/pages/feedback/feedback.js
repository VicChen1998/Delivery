// pages/feedback/feedback.js
const app = getApp()

Page({

    data: {
        entrance: '',
        order_id: null,

        tip_1: '',
        tip_2: '',
        title_1: '',
        describe_1: '',

        imgPaths: []
    },

    onLoad: function (options) {
        this.setData({ entrance: options.entrance })

        var title = ''
        switch (options.entrance) {
            case 'suggestion': {
                title = '改进建议'
                this.setData({
                    tip_1: '请问您对轻骑有什么建议',
                    tip_2: '建议被采纳可以得到优惠券大礼包以示感谢~',
                    title_1: '请写下您的建议',
                })
                break
            }
            case 'order_detail': {
                title = '售后服务'
                this.setData({
                    order_id: app.globalData.feedback_order_id,
                    tip_1: '对此订单有疑问？',
                    title_1: '请详细描述您遇到的问题',
                })
                break
            }
            case 'problem_feedback': {
                title = '问题反馈'
                this.setData({
                    tip_1: '十分抱歉给您带来不便',
                    tip_2: '帮助我们修复问题可以得到优惠券以示感谢~',
                    title_1: '请详细描述您遇到的问题',
                    describe_1: '比如在哪个页面出错、具体表现、是否有错误提示等',
                })
                break
            }
        }
        wx.setNavigationBarTitle({ title: title })
    },

    chooseImage: function (e) {
        wx.chooseImage({
            count: 6 - this.data.imgPaths.length,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: res => {
                this.setData({ imgPaths: this.data.imgPaths.concat(res.tempFilePaths) })
            },
        })
    },

    previewImage: function (e) {
        wx.previewImage({
            urls: this.data.imgPaths,
            current: this.data.imgPaths[e.target.dataset.index]
        })
    },

    deleteImage: function (e) {
        wx.showActionSheet({
            itemList: ['取消选择'],
            success: res => {
                this.data.imgPaths.splice(e.target.dataset.index, 1)
                this.setData({
                    imgPaths: this.data.imgPaths
                })
            }
        })
    },

    submit: function (e) {

        if (e.detail.value.describe.length < 20) {
            wx.showToast({
                title: '请至少输入20个字~',
                icon: 'none'
            })
            return false;
        }

        wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 10000
        })

        var openid = ''
        if (app.globalData.userAddress)
            if (app.globalData.userAddress.openid)
                openid = app.globalData.userAddress.openid

        var data = {
            'entrance': this.data.entrance,
            'openid': openid,
            'content': e.detail.value.describe,
        }

        if (this.data.entrance == 'order_detail') {
            data.order_id = this.data.order_id
        }

        wx.request({
            url: app.globalData.host + 'feedback',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: data,
            success: res => {
                if (res.data.status == 'success') {
                    this.uploadImage(res.data.feedback_id)
                    wx.showToast({
                        title: '提交完成',
                        duration: 1200,
                    })
                    setTimeout(e => {
                        wx.navigateTo({
                            url: '/pages/feedback/success',
                        })
                    }, 1200)
                }
            }
        })
    },

    uploadImage: function (feedback_id) {
        for (var i = 0; i < this.data.imgPaths.length; i++) {
            wx.uploadFile({
                url: app.globalData.host + 'feedback/upload_img',
                filePath: this.data.imgPaths[i],
                name: 'img',
                formData: {
                    'feedback_id': feedback_id,
                    'imgIndex': i
                },
                header: { 'Content-Type': 'multipart/form-data' },
                success: res => {
                    res.data = JSON.parse(res.data)
                    if (res.data.status != 'success') {
                        wx.showModal({
                            title: '图片' + i + '上传失败',
                            content: '反馈信息提交成功，但图片' + i + '上传失败',
                        })
                    }
                },
                fail: upload_res => {
                    wx.showToast({
                        title: '图片' + i + '上传失败',
                        icon: 'none'
                    })
                }
            })
        }
    }
})