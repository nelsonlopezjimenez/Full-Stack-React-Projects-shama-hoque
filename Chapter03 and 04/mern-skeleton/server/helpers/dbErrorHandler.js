const getUniqueErrorMessage = (err) => {
  const [field] = Object.keys(err.keyValue ?? {})
  if (!field) return 'Unique field already exists'
  return `${field.charAt(0).toUpperCase()}${field.slice(1)} already exists`
}

const getErrorMessage = (err) => {
  if (err.code === 11000 || err.code === 11001) {
    return getUniqueErrorMessage(err)
  }
  if (err.name === 'ValidationError') {
    return Object.values(err.errors)
      .map((e) => e.message)
      .join(' ')
  }
  return 'Something went wrong'
}

export default { getErrorMessage }
