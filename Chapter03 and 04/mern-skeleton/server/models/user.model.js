import mongoose from 'mongoose'

// [BEGINNER] A schema describes what a user looks like and which rules every user must follow.
// MongoDB itself would store anything; Mongoose checks these rules before saving.
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
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
})

// [BEGINNER] A model is the schema + a collection in the database. 'User' → collection "users".
// User.find(), new User(...).save() and friends all talk to that collection.
// `export default` makes the model the thing other files get with `import User from ...`.
export default mongoose.model('User', UserSchema)
