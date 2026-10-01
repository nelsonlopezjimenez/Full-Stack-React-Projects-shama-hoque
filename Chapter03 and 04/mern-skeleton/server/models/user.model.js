import mongoose from 'mongoose'

// [BEGINNER] A schema describes what a user looks like and which rules every user must follow.
// MongoDB itself would store anything; Mongoose checks these rules before saving.
//
// [BEGINNER] TEACHING VERSION: the password is stored exactly as the user typed it, so the
// sign-in lesson can focus on "check the password, remember who signed in".
// NEVER do this in a real app: anyone who can read the database (or a backup of it) can read
// every password. Stage 14 stores a salted hash instead.
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // removes spaces at the start and the end
    // [BEGINNER] [true, 'message'] is the documented form: "required, and if missing say this".
    required: [true, 'Name is required.']
  },
  email: {
    type: String,
    trim: true,
    // [ADVANCED] `unique` is NOT a validator: it only asks MongoDB to create a unique index.
    // A common extra is `lowercase: true`, so 'A@x.io' and 'a@x.io' count as the same email.
    unique: true,
    // [BEGINNER] match: the value must fit this regular expression ("something@something.something").
    match: [/.+@.+\..+/, 'Please fill a valid email address.'],
    required: [true, 'Email is required.']
  },
  password: {
    type: String,
    required: [true, 'Password is required.'],
    // [BEGINNER] minlength is a built-in rule for strings: at least 6 characters.
    minlength: [6, 'Password must be at least 6 characters.']
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
}, {
  // [BEGINNER] res.json(user) calls user.toJSON() behind the scenes. Removing the password
  // here means NO route can leak it by accident, including routes written later by someone
  // who forgot about it.
  // [ADVANCED] The alternative is `select: false` on the field; then sign-in must ask for it
  // with .select('+password'). toJSON keeps the queries unchanged.
  toJSON: {
    transform: (doc, ret) => {
      delete ret.password
      return ret
    }
  }
})

// [BEGINNER] A model is the schema + a collection in the database. 'User' → collection "users".
// User.find(), new User(...).save() and friends all talk to that collection.
// `export default` makes the model the thing other files get with `import User from ...`.
export default mongoose.model('User', UserSchema)
