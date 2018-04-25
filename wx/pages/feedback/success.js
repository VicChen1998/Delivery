// pages/feedback/success.js
Page({

    data: {

    },

    onLoad: function (options) {
        setTimeout(t => {
            wx.navigateBack({ delta: 2 })
        }, 4000)
    },

})