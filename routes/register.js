const User = require('../models/user')

exports.form = (req, res) => {
	res.render('register', {
		title: 'Register'
	})
}

// 处理提交到 /register 上的 HTTP POST 请求的路由函数
exports.submit = (req, res, next) => {
	const data = req.body.user
	// 检查用户名是否唯一
	User.getByName(data.name, (err, user) => {
		if (err) return next(err)
		if (user.id) {
			res.error('Username already taken')
			res.redirect('back')
		} else {
			// 用 POST 数据创建用户
			user = new User({
				name: data.name,
				pass: data.pass
			})
			user.save((err) => {
				if (err) return next(err)
				req.session.uid = user.id
				res.redirect('/')
			})
		}
	})
}