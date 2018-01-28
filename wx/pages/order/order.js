//index.js
const app = getApp()

Page({
    data: {
        openid: null,
        userInfo: {},
        deliveryInfo: {},
        hasUserInfo: false,
        hasDeliveryInfo: false,

        pkg_position_array: ["-- 请选择 --", "菊二自助", "菊二分拣区", "菊二延时区2-2", "菊二前台", "菊二顺丰专区", "菊五自助一区", "菊五自助二区", "菊五分拣区", "菊五C区"],
        pkg_position_index: 0,
        community_array: ["-- 请选择 --", "柳园", "荷园", "菊园", "松园", "护理学院"],
        community_index: 0,

    },

    onLoad: function () {

        function upload_userinfo(data) {
            if (data.hasUserInfo && data.openid != null && data.deliveryInfo.first_signin) {
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

    pkg_position_onchange: function (e) {
        this.setData({
            pkg_position_index: e.detail.value
        })
    },
    community_onchange: function(e){
        this.setData({
            community_index: e.detail.value
        })
    },
    order: function(){
        wx.request({
            url: 'https://www.vicchen.club/get_university',
            data: {'university':'郑州大学', 'campus':'新校区','community':'柳园'},
            method: 'GET',
            success: res => {
                console.log(res)
            }
        })
    }
})
