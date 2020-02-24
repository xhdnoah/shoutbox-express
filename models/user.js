// 用户模型
const redis = require('redis')
const bcrypt = require('bcrypt')
// 创建到 Redis 的长连接
const db = redis.createClient()

class User {
	constructor(obj) {
		for (let key in obj) {
			this[key] = obj[key]
		}
	}

	save(cb) {
		if (this.id) {
			this.update(cb)
		} else {
			// 新增创建唯一 ID
			db.incr('user:ids', (err, id) => {
				if (err) return cb(err)
				this.id = id
				this.hashPassword((err) => {
					if (err) return cb(err)
					// 保存用户属性
					this.update(cb)
				})
			})
		}
	}

	update(cb) {
		const id = this.id
		// 用名称索引用户 ID
		db.set(`user:id:${this.name}`, id, (err) => {
			if (err) return cb(err)
			// 用 Redis 存储当前类的属性
			db.hmset(`user:${id}`, this, (err) => {
				cb(err)
			})
		})
	}

	hashPassword(cb) {
		// 生成 12 字符的盐
		bcrypt.genSalt(12, (err, salt) => {
			if (err) return cb(err)
			this.salt = salt
			// 生成 hash
			bcrypt.hash(this.pass, salt, (err, hash) => {
				if (err) return cb(err)
				this.pass = hash
				cb()
			})
		})
	}

	// 去掉敏感数据
	toJSON() {
		return {
			id: this.id,
			name: this.name
		}
	}

	// 通过用户名查找 ID
	// 将 ID 传给 User.get() 获取 Redis 中的用户数据
	static getByName(name, cb) {
		User.getId(name, (err, id) => {
			if (err) return cb(err)
			User.get(id, cb)
		})
	}

	static getId(name, cb) {
		db.get(`user:id:${name}`, cb)
	}

	static get(id, cb) {
		// 获取普通对象 hash
		db.hgetall(`user:${id}`, (err, user) => {
			if (err) return cb(err)
			// 普通对象转换新的 User 对象
			cb(null, new User(user))
		})
	}

	static authenticate(name, pass, cb) {
		User.getByName(name, (err, user) => {
			if (err) return cb(err)
			// 用户不存在
			if (!user.id) return cb()
			bcrypt.hash(pass, user.salt, (err, hash) => {
				if (err) return cb(err)
				if (hash == user.pass) return cb(null, user)
				// 密码不匹配
				cb()
			})
		})
	}
}

// const user = new User({
// 	name: 'Example',
// 	pass: 'test'
// })
// user.save((err) => {
// 	if (err) console.error(err)
// 	console.log('user id %d', user.id)
// })

module.exports = User