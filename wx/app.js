//app.js

App({
    globalData: {
        host: 'https://www.vicchen.club/',
        userAddress: null,
        pkg_position_range: null,
        order: null,    // 查看订单详情时用全局数据传递参数
        hasChangeAddress: false,
        needRefreshVoucher: false,
        hasOpenSharePage: false,

        isModifying: false,
        modifying_order: {},

        isInvited: false,
        inviter: ''
    },

    onLaunch: function (options) {

        console.log(options)

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
                        this.checkIsFirstSignin(options)
                    }
                })
            },
            fail: response => {
                wx.showToast({
                    title: '登录失败',
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

    checkIsFirstSignin: function (options) {
        if (this.globalData.userAddress != null && this.globalData.userAddress.first_signin) {
            wx.switchTab({
                url: '/pages/settings/settings',
            })

            if ((options.scene == 1011 || options.scene == 1012 || options.scene == 1013 ||
                options.scene == 1025 || options.scene == 1031 || options.scene == 1032 ||
                options.scene == 1047 || options.scene == 1048 || options.scene == 1049 ||
                options.scene == 1007 || options.scene == 1008) && options.query.inviter != undefined) {
                this.globalData.isInvited = true
                this.globalData.inviter = options.query.inviter

                wx.request({
                    url: this.globalData.host + 'upload_invite_info',
                    method: 'POST',
                    header: { 'content-type': 'application/x-www-form-urlencoded' },
                    data: {
                        'openid': this.globalData.userAddress.openid,
                        'inviter_openid': this.globalData.inviter
                    }
                })
            }
        }
    },

    uploadUserInfo: function (e) {
        if (e.detail.errMsg != 'getUserInfo:ok')
            return false
        if (!this.globalData.userAddress.openid)
            return false

        var userInfo = e.detail.userInfo
        userInfo.openid = this.globalData.userAddress.openid

        wx.request({
            url: this.globalData.host + 'upload_userinfo',
            method: 'POST',
            header: { 'content-type': 'application/x-www-form-urlencoded' },
            data: userInfo
        })
    },

    refreshVoucher: function (callback) {
        if (this.globalData.userAddress.openid) {
            wx.request({
                url: this.globalData.host + 'get_voucher',
                data: { 'openid': this.globalData.userAddress.openid },
                success: response => {
                    if (response.data.get_voucher_status == 'success') {
                        this.globalData.userAddress.voucher = response.data.voucher
                        if (callback)
                            callback()
                    }
                }
            })
        }
    },

    onShareAppMessage: function (options) {
        return {
            path: '/pages/order/order?inviter=' + this.globalData.userAddress.openid,
            imageUrl: this.globalData.host + 'resource?name=logo.jpg'
        }
    }

})