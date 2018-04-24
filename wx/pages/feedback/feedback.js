// pages/feedback/feedback.js
const app = getApp()

Page({

    data: {
        imgPaths: []
    },

    onLoad: function (options) {
        var title = ''
        switch (options.from) {
            case 'after_sale':
                title = '售后服务'; break
            case 'order_detail':
                title = '售后服务'; break
            case 'problem_feedback':
                title = '问题反馈'; break
        }
        wx.setNavigationBarTitle({ title: title })
    },

    chooseImage: function (e) {
        wx.chooseImage({
            count: 9 - this.data.imgPaths.length,
            sizeType: ['compressed'],
            sourceType: ['album'],
            success: res => {
                console.log(res)
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

        wx.showToast({
            title: '上传中',
            icon: 'loading',
            duration: 10000
        })

        var openid = ''
        if (app.globalData.userAddress)
            if (app.globalData.userAddress.openid)
                openid = app.globalData.userAddress.openid

        wx.request({
            url: app.globalData.host + 'feedback',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: {
                'openid': openid,
                'content': e.detail.value.describe,
            },
            success: res => {
                if (res.data.status == 'success') {
                    this.uploadImage(res.data.feedback_id)
                    wx.showToast({ title: '提交完成' })
                    setTimeout(e => {
                        wx.navigateTo({
                            url: '/pages/feedback/success',
                        })
                    }, 2000)
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