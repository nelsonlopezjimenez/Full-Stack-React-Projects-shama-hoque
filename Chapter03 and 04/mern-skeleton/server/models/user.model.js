import mongoose from 'mongoose'
// [BEGINNER] The 'node:' prefix marks a built-in Node module, so it can never be confused
// with an npm package of the same name.
import crypto from 'node:crypto'

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
}, {
  // [BEGINNER] res.json(user) calls user.toJSON() behind the scenes. Removing the secret fields
  // here means NO route can leak them by accident; the book set them to undefined by hand in
  // read, update and remove, and a new route that forgot would have sent the hash.
  // [ADVANCED] The alternative is `select: false` on the fields; then signin must ask for them
  // with .select('+hashed_password +salt'). toJSON keeps the queries unchanged.
  toJSON: {
    transform: (doc, ret) => {
      delete ret.hashed_password
      delete ret.salt
      return ret
    }
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

// [BEGINNER] Method shorthand `authenticate(plainText) { ... }` is the modern way to write
// `authenticate: function(plainText) { ... }`. It still gets its own `this` (unlike an arrow).
UserSchema.methods = {
  authenticate(plainText) {
    if (!plainText || !this.hashed_password) return false
    const candidate = Buffer.from(this.encryptPassword(plainText), 'hex')
    const stored = Buffer.from(this.hashed_password, 'hex')
    // [ADVANCED] timingSafeEqual takes the same time whether the first or the last byte
    // differs, so an attacker cannot guess the hash byte by byte from response times
    // (`===` stops at the first difference). It throws if the lengths differ, hence the check.
    return candidate.length === stored.length && crypto.timingSafeEqual(candidate, stored)
  },
  // [ADVANCED] The book used HMAC-SHA1: very fast to compute, so a stolen database can be
  // brute-forced at billions of guesses per second. scrypt is a *password* hashing function:
  // deliberately slow and memory-hungry. (bcrypt and argon2 are the other common choices;
  // scrypt is built into Node, so no extra package is needed.)
  // scryptSync blocks the event loop for a few dozen milliseconds per call. It is used here
  // because the `password` virtual setter above cannot be async; a busy production app would
  // hash in an async pre('save') hook with the callback/promise version of crypto.scrypt.
  // Passwords hashed with the old SHA1 code no longer match (different length) → those users
  // must reset their password. A gentler path is "rehash on next successful login".
  encryptPassword(password) {
    if (!password) return ''
    return crypto.scryptSync(password, this.salt, 64).toString('hex')
  },
  makeSalt() {
    // [BEGINNER] The book built the salt from Date and Math.random(), which are predictable.
    // crypto.randomBytes comes from the operating system's secure random generator.
    return crypto.randomBytes(16).toString('hex')
  }
}

export default mongoose.model('User', UserSchema)
