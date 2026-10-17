const signin = (user) => {
  return fetch('/api/auth/sessions', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(user),
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

const signout = () => {
  return fetch('/api/auth/sessions', {
    method: 'DELETE',
  })
    .then((response) => {
      return response.json();
    })
    .catch((err) => console.log(err));
};

export { signin, signout };
