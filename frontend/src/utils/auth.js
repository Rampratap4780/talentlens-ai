// Simple auth — localStorage mein save
export function saveUser(user) {
  localStorage.setItem('talentlens_user', JSON.stringify(user))
}

export function getUser() {
  try {
    const u = localStorage.getItem('talentlens_user')
    return u ? JSON.parse(u) : null
  } catch {
    return null
  }
}

export function logout() {
  localStorage.removeItem('talentlens_user')
}

export function isAdmin() {
  return getUser()?.role === 'admin'
}

export function isCandidate() {
  return getUser()?.role === 'candidate'
}

export function isLoggedIn() {
  return !!getUser()
}