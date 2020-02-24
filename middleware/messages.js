// 使用 session 变量维护用户消息队列
const express = require('express')

// res.message 函数把消息添加到来自任何 Express 请求的会话变量中
function message(req) {
	return (msg, type) => {
		type = type || 'info'
		let sess = req.session
		sess.messages = sess.messages || []
		sess.messages.push({
			type: type,
			string: msg
		})
	}
}

module.exports = (req, res, next) => {
	res.message = message(req)
	res.error = (msg) => {
		return res.message(msg, 'error')
	}
	res.locals.messages = req.session.messages || []
	res.locals.removeMessages = () => {
		req.session.messages = []
	}
	next()
}