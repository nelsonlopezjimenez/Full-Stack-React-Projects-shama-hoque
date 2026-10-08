export const fakeToken = (payload) => {
  const encode = (obj) => btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode(payload)}.signature`
}

const inOneHour = () => Math.floor(Date.now() / 1000) + 3600

export const signInAs = (user = { _id: 'u1', name: 'Ann', email: 'ann@test.io' }) => {
  sessionStorage.setItem('jwt', JSON.stringify({ token: fakeToken({ _id: user._id, exp: inOneHour() }), user }))
  return user
}
