import mongoose from 'mongoose'
import crypto from 'crypto'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    // [BEGINNER] [true, 'message'] is the documented form: "required, and if missing say this".
    required: [true, 'Name is required.']
  },
  email: {
    type: String,
    trim: true,
    // [ADVANCED] `unique` is NOT a validator: it only asks MongoDB to create a unique index.
    // The book wrote unique: 'Email already exists', but that text was never shown; the
    // message comes from helpers/dbErrorHandler.js when MongoDB reports error 11000.
    // A common extra is `lowercase: true`, so 'A@x.io' and 'a@x.io' count as the same email.
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
})

// [BEGINNER] Mongoose calls these with `this` set to the document, so they must be regular
// `function`s. An arrow function would not get its own `this` and this.salt would be undefined.
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

// [ADVANCED] The book attached this check to the hashed_password validator (with a validator
// that returned nothing). A 'validate' pre-hook says what it does. In Mongoose 9, pre hooks
// no longer receive `next`: a plain (or async) function is enough.
// (The book's second check, 'Password is required' for new users, duplicated the
// `required` rule on hashed_password above, so it was removed.)
UserSchema.pre('validate', function() {
  if (this._password && this._password.length < 6) {
    this.invalidate('password', 'Password must be at least 6 characters.')
  }
})

UserSchema.methods = {
  authenticate: function(plainText) {
    return this.encryptPassword(plainText) === this.hashed_password
  },
  encryptPassword: function(password) {
    if (!password) return ''
    try {
      return crypto
        .createHmac('sha1', this.salt)
        .update(password)
        .digest('hex')
    } catch (err) {
      return ''
    }
  },
  makeSalt: function() {
    return Math.round((new Date().valueOf() * Math.random())) + ''
  }
}

export default mongoose.model('User', UserSchema)
