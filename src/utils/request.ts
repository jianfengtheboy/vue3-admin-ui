import axios from 'axios'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Session } from '/@/utils/storage'

// 新建一个axios实例
const service = axios.create({
	baseURL: import.meta.env.VITE_API_URL as any,
	timeout: 5000,
	headers: { 'Content-Type': 'application/json' }
})

// 添加请求拦截器
service.interceptors.request.use(
	(config) => {
		// 发送请求之前处理 token
		if (Session.get('token')) {
			config.headers.common['Authorization'] = `${Session.get('token')}`
		}
		return config
	},
	(error) => {
		// 请求错误处理
		return Promise.reject(error)
	}
)

// 添加响应拦截器
service.interceptors.response.use(
	(response) => {
		// 响应数据处理
		const res = response.data
		if (res.code && res.code !== 0) {
			// token 过期或者账号已在别处登录
			if ([401, 4001].includes(res.code)) {
				// 清除浏览器所有缓存
				Session.clear()
				// 跳转登陆页
				window.location.href = '/'
				ElMessageBox.alert('你已被登出，请重新登录', '提示', {})
					.then(() => {})
					.catch(() => {})
			}
			return Promise.reject(service.interceptors.response)
		} else {
			return response.data
		}
	},
	(error) => {
		// 响应错误数据处理
		if (error.message.indexOf('timeout') != -1) {
			ElMessage.error('操作失败，网络超时')
		} else  if (error.message == 'Network Error') {
			ElMessage.error('操作失败，网络连接错误')
		} else {
			if (error.response.data) ElMessage.error(`操作失败，${error.response.statusText}`)
			else ElMessage.error('操作失败，接口路径找不到')
		}
	}
)

// 导出axios实例
export default service
