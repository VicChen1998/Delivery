// pages/staff/manage/feedback/feedback.js
const app = getApp()

Page({

    data: {
        feedback_list: [],
    },

    onLoad: function (options) {
        wx.request({
            url: app.globalData.host + 'get_feedback',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                if (response.data.status == 'success') {

                    for (var i = 0; i < response.data.feedback_list.length; i++) {
                        for (var j = 0; j < response.data.feedback_list[i].images.length; j++) {
                            response.data.feedback_list[i].images[j] = app.globalData.host + 'media?name=' + response.data.feedback_list[i].images[j]
                        }
                    }

                    this.setData({ feedback_list: response.data.feedback_list })
                    
                }
            }
        })
    },

    previewImage: function (e) {
        wx.previewImage({
            urls: this.data.feedback_list[e.target.dataset.index].images,
            current: this.data.feedback_list[e.target.dataset.index].images[e.target.dataset.imgindex]
        })
    },

})