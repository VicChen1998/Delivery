// pages/deliverer/not_pickup_list/not_pickup_list.js
const app = getApp()

Page({

  data: {
      pickup_fail_list: []
  },

  onLoad: function (options) {
      wx.request({
          url: app.globalData.host + 'get_pickup_fail_list',
          data: {
              'openid': app.globalData.userAddress.openid,
              'campus_id': app.globalData.userAddress.campus.id
          },
          success: response => {
              this.setData({
                  title: response.data.pkg_position_name,
                  pickup_fail_list: response.data.pickup_fail_list
              })
          }
      })
  },

})