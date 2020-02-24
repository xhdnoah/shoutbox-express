module.exports = (cb, perpage) => {
	// 每页记录条数默认值为 10
	perpage = perpage || 10
	// 返回中间件函数
	return (req, res, next) => {
		// 将参数 page 解析为十进制的整型值
		let page = Math.max(
			parseInt(req.params.page || '1', 10),
			1
		) - 1
		// 调用传入的函数
		cb((err, total) => {
			if (err) return next(err)
			req.page = res.locals.page = {
				number: page,
				perpage: perpage,
				from: page * perpage,
				to: page * perpage + perpage - 1,
				total: total,
				count: Math.ceil(total / perpage)
			}
			next()
		})
	}
}