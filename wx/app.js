//app.js

App({
    globalData: {
        host: 'https://www.vicchen.club/',
        userInfo: null,
        userAddress: null,
        pkg_position_range: null,
        order: null,    // 查看订单详情时用全局数据传递参数
        payint_order_id: null,
        hasChangeAddress: false,
        needRefreshVoucher: false,

        isModifying: false,
        modifying_order: {},
    },

    onLaunch: function (options) {

        console.log(options)

        // 获取用户信息
        wx.getSetting({
            success: response => {
                wx.getUserInfo({
                    success: response => {
                        this.globalData.userInfo = response.userInfo
                        if (this.sendUserInfoToOrderPage)
                            this.sendUserInfoToOrderPage(response)
                        if (this.sendUserInfoToRecordPage)
                            this.sendUserInfoToRecordPage(response)
                        if(this.sendUserInfoToSettingsPage)
                            this.sendUserInfoToSettingsPage(response)

                        this.checkIsFirstSignin(this.globalData)
                    }
                })
            }
        })

        // 登录
        wx.login({
            success: response => {
                wx.request({
                    url: this.globalData.host + 'signin',
                    data: { js_code: response.code, },
                    method: 'GET',
                    success: response => {
                        this.globalData.userAddress = response.data
                        if (this.sendUserAddressToOrderPage)
                            this.sendUserAddressToOrderPage(response)
                        if (this.sendUserAddressToRecordPage)
                            this.sendUserAddressToRecordPage(response)
                        if (this.sendUserAddressToSettingsPage)
                            this.sendUserAddressToSettingsPage(response)

                        this.get_pkg_position(this.globalData.userAddress.campus.id)
                        this.checkIsFirstSignin(this.globalData)
                    }
                })
            }
        })

    },

    get_pkg_position: function (campus_id) {
        wx.request({
            url: this.globalData.host + 'get_pkgPosition',
            data: { 'campus_id': campus_id },
            success: response => {
                this.globalData.pkg_position_range = response.data.pkg_position_list
                if (this.pkg_position_range_ReadyCallback)
                    this.pkg_position_range_ReadyCallback(response)
            }
        })
    },

    checkIsFirstSignin: function (globalData) {
        if (globalData.userAddress != null && globalData.userInfo != null && globalData.userAddress.first_signin) {
            wx.switchTab({
                url: '/pages/settings/settings',
            })

            globalData.userInfo.openid = globalData.userAddress.openid
            wx.request({
                url: this.globalData.host + 'upload_userinfo',
                data: globalData.userInfo,
                method: 'POST',
                header: { 'content-type': 'application/x-www-form-urlencoded' },
            })
        }
    }

})