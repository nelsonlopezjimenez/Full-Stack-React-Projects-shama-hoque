import mongoose from 'mongoose'
import crypto from 'node:crypto'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required.']
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address.'],
    required: [true, 'Email is required.']
  },
  hashed_password: {
    type: String,
    required: [true, 'Password is required.']
  },
  salt: String,
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: {
    transform: (doc, ret) => {
      delete ret.hashed_password
      delete ret.salt
      return ret
    }
  }
})

UserSchema
  .virtual('password')
  .set(function(password) {
    this._password = password
    this.salt = this.makeSalt()
    this.hashed_password = this.encryptPassword(password)
  })
  .get(function() {
    return this._password
  })

UserSchema.pre('validate', function() {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
})

UserSchema.methods = {
  authenticate(plainText) {
    if (!plainText || !this.hashed_password) return false
    const candidate = Buffer.from(this.encryptPassword(plainText), 'hex')
    const stored = Buffer.from(this.hashed_password, 'hex')
    return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored)
  },
  encryptPassword(password) {
    if (!password) return ''
    return crypto.scryptSync(password, this.salt, 64).toString('hex')
  },
  makeSalt() {
    return crypto.randomBytes(16).toString('hex')
  }
}

export default mongoose.model('User', UserSchema)
