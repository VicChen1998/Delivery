// pages/staff/manage/feedback/feedback.js
const app = getApp()

Page({

    data: {
        feedback_list: []
    },

    onLoad: function (options) {
        wx.request({
            url: app.globalData.host + 'get_feedback',
            data: { 'openid': app.globalData.userAddress.openid },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({ feedback_list: response.data.feedback_list })
                }
            }
        })
    },

})