// [BEGINNER] ES modules always run in strict mode, so the book's 'use strict' line is gone.

/**
 * Get unique error field name
 */
// [ADVANCED] The book parsed err.message looking for '.$email_1'. That message format
// changed in MongoDB 4.2 ('... index: email_1 dup key: { email: "a@b.c" }'), so users saw a
// garbled text. The driver now gives the offending field(s) as an object: err.keyValue.
const getUniqueErrorMessage = (err) => {
  // [BEGINNER] Array destructuring: take the first key of { email: 'a@b.c' } → 'email'.
  const [field] = Object.keys(err.keyValue ?? {})
  if (!field) return 'Unique field already exists'
  return `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists`
}

/**
 * Get the error message from error object
 */
const getErrorMessage = (err) => {
  // 11000 = duplicate key (a `unique` index was violated)
  if (err.code === 11000 || err.code === 11001) {
    return getUniqueErrorMessage(err)
  }
  if (err.name === 'ValidationError') {
    // [BEGINNER] Object.values() turns { name: {...}, email: {...} } into an array, so we can
    // map() it. The book's for...in loop kept overwriting `message`, so only the LAST
    // failing field was reported; now every message is returned.
    return Object.values(err.errors)
      .map((e) => e.message)
      .join(' ')
  }
  return 'Something went wrong'
}

export default { getErrorMessage }
