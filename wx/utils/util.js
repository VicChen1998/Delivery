const formatTime = date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()

    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
    n = n.toString()
    return n[1] ? n : '0' + n
}

const deepCopyObj = src => {
    var dst = {};
    for (var prop in src) {
        if (src.hasOwnProperty(prop)) {
            dst[prop] = src[prop];
        }
    }
    return dst;
}

const deepCopyArray = src => {
    var dst = [];
    for (let i = 0; i < src.length; i++) {
        dst.push(src[i]);
    }
    return dst;
}

module.exports = {
    formatTime: formatTime,
    deepCopyObj: deepCopyObj,
    deepCopyArray: deepCopyArray
}
