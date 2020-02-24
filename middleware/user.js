// 用户加载中间件，为每个请求加载用户数据
const User = require('../models/user')

module.exports = (req, res, next) => {
	// 检查是否通过 API 发送请求
	if (req.remoteUser) {
		res.locals.user = req.remoteUser
	}
	// 从会话中取出已登陆用户 ID
	const uid = req.session.uid
	if (!uid) return next()
	// 从 Redis 中取出已登陆用户数据
	User.get(uid, (err, user) => {
		if (err) return next(err)
		// 将用户数据输出到响应对象中
		req.user = res.locals.user = user
		next()
	})
}