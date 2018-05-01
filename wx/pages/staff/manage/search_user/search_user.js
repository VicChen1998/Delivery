// pages/staff/manage/search_user/search_user.js
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
            url: app.globalData.host + 'manager_search_user',
            data: {
                'openid': app.globalData.userAddress.openid,
                'keyword': options.keyword
            },
            success: response => {
                if (response.data.status == 'success') {
                    this.setData({
                        search_list: response.data.results,
                        count: response.data.count,
                        finish: true
                    })
                }
            }
        })

    },

    more: function (e) {
        var user_openid = e.target.dataset.openid
        var index = e.target.dataset.index

        wx.showActionSheet({
            itemList: ['发放免单券', '查看相关订单'],
            success: res => {
                if (res.tapIndex == 0) {
                    wx.request({
                        url: app.globalData.host + 'give_voucher',
                        method: 'POST',
                        header: { 'content-type': 'application/x-www-form-urlencoded' },
                        data: {
                            'openid': app.globalData.userAddress.openid,
                            'user_openid': user_openid
                        },
                        success: response => {
                            if (response.data.status == 'success') {
                                this.data.search_list[index].voucher = response.data.current_voucher
                                this.setData({
                                    search_list: this.data.search_list
                                })
                            }
                            wx.showToast({ title: '发放成功' })
                        }
                    })
                }
                else if (res.tapIndex == 1) {
                    wx.navigateTo({
                        url: '/pages/staff/search/search' + '?keyword=' + this.data.search_list[index].name,
                    })
                }
            }
        })
    }

})