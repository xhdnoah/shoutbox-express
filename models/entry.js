const redis = require('redis')
// 创建 Redis 客户端实例
const db = redis.createClient()

// 消息条目模型
class Entry {
	constructor(obj) {
		for (let key in obj) {
			this[key] = obj[key]
		}
	}

	save(cb) {
		const entryJSON = JSON.stringify(this)
		// 将 JSON 字符串保存到 Redis 列表中
		db.lpush(
			'entries',
			entryJSON,
			(err) => {
				if (err) return cb(err)
				cb()
			}
		)
	}
	// 获取消息
	static getRange(from, to, cb) {
		db.lrange('entries', from, to, (err, items) => {
			if (err) return cb(err)
			let entries = []
			// 解码之前保存为 JSON 的消息记录
			items.forEach((item) => {
				entries.push(JSON.parse(item))
			})
			cb(null, entries)
		})
	}
}

module.exports = Entry