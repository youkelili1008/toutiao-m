/* 
请求模块
*/

import store from '@/store'
import axios from 'axios'

const request = axios.create({
    // 接口的基准路径
    baseURL: 'http://toutiao.itheima.net'
})

// 请求拦截器
request.interceptors.request.use(function (config) {
    // 请求发起会经过这里
    // config :本次请求的请求配置对象
    const { user } = store.state
    if (user && user.token) {
        config.headers.Authorization = `Bearer ${user.token}`
    }
    console.log(config);
    // 注意:必须返回config配置对象，否则请求停止出不去
    return config
}, function (error) {
    // 请求出错（即没有发出去）会进入这里
    return Promise.reject(error)
})

// 响应拦截器

export default request