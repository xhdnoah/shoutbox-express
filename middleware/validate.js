// 提炼通用的校验中间件

// 解析 entry[name] 符号
function parseField(field) {
	return field
		.split(/\[|\]/)
		.filter((s) => s)
}

// 基于 parseField 结果查找属性 如标题 entry[title]
function getField(req, field) {
	// val = entry[title,...]
	let val = req.body
	field.forEach((prop) => {
		val = val[prop]
	})
	return val
}

exports.required = (field) => {
	field = parseField(field) // [title,...]
	return (req, res, next) => {
		if (getField(req, field)) {
			next()
		} else {
			res.error(`${field.join(' ')} is required`)
			res.redirect('back')
		}
	}
}

exports.lengthAbove = (field, len) => {
	field = parseField(field)
	return (req, res, next) => {
		if (getField(req, field).length > len) {
			next()
		} else {
			const fields = field.join(' ')
			res.error(`${fields} must have more than ${len} characters`)
			res.redirect('back')
		}
	}
}