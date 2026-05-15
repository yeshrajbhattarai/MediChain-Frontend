export default function getCurrentRole() {

  const token =
    localStorage.getItem('access')

  if (!token) {
    return null
  }

  try {

    const payload =
      JSON.parse(
        atob(token.split('.')[1])
      )

    return payload.role

  } catch (error) {

    console.error(
      'Failed to decode token',
      error
    )

    return null
  }
}