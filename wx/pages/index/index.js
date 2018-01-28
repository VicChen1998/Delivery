//index.js
const app = getApp()

Page({
    data: {
        debug: true,
        openid: null,
        userInfo: {},
        deliveryInfo: {},
        hasUserInfo: false,
        hasDeliveryInfo: false
    },

    onLoad: function () {

        function upload_userinfo(data){
            if (data.hasUserInfo && data.openid!=null && data.deliveryInfo.first_signin) {
                wx.request({
                    url: 'https://www.vicchen.club/upload_userinfo',
                    data: data.userInfo,
                    method: 'POST',
                    header: {
                        'content-type': 'application/x-www-form-urlencoded'
                    },
                })
            }
        }

        // 登录
        wx.login({
            success: response => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
                wx.request({
                    url: 'https://www.vicchen.club/signin',
                    data: { js_code: response.code, },
                    method: 'GET',
                    success: response => {
                        this.setData({
                            deliveryInfo: response.data,
                            hasDeliveryInfo: true
                        })
                        this.data.openid = response.data.openid
                        app.globalData.deliveryInfo = response.data

                        this.data.userInfo.openid = this.data.openid
                        upload_userinfo(this.data)
                    }
                })
            }
        })

        if (app.globalData.userInfo) {
            this.setData({
                userInfo: app.globalData.userInfo,
                hasUserInfo: true
            })

            this.data.userInfo.openid = this.data.openid
            upload_userinfo(this.data)
        } else {
            // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
            // 所以此处加入 callback 以防止这种情况
            app.userInfoReadyCallback = res => {
                this.setData({
                    userInfo: res.userInfo,
                    hasUserInfo: true
                })

                this.data.userInfo.openid = this.data.openid
                upload_userinfo(this.data)
            }
        }

        
    },

    viewtap: function () {
        console.log(this.data.userInfo)
        console.log(app.globalData.deliveryInfo)
        console.log(this.data.deliveryInfo)
    }
})
