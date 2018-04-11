// pages/deliverer/search/search.js
const app = getApp()

Page({

    data: {
        keyword: '',
        finish: false,
        search_list: {},
        count: 0,
    },

    onLoad: function (options) {
        this.setData({
            keyword: options.keyword
        })

        wx.request({
            url: app.globalData.host + 'deliverer_search',
            data: {
                'openid': app.globalData.userAddress.openid,
                'keyword': options.keyword
            },
            success: response => {
                if(response.data.status == 'success'){
                    this.setData({
                        search_list: response.data.results,
                        count: response.data.count,
                        finish: true
                    })
                }
            }
        })
    },
})