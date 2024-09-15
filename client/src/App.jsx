import Navbar from './Navbar'
import { useSearchParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Home from './Home'
import Upgrade from './Upgrade'
import { Routes, Route } from 'react-router-dom'

function App() {
  const [searchParams, setSearchParams] = useSearchParams()
  const code = searchParams.get('code')
  // console.log('code:', code)
  const [user, setUser] = useState({
    sub: '',
    username: '',
    credit_balance: 0,
    email: '',
    tier: 1,
  })
  const [token, setToken] = useState('')
  const clientID = import.meta.env.VITE_COGNITO_CLIENT_ID || ''
  const clientSecret = import.meta.env.VITE_COGNITO_CLIENT_SECRET || ''
  const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN || ''

  const credentials = `${clientID}:${clientSecret}`
  const base64Credentials = btoa(credentials)
  const basicAuthorization = `Basic ${base64Credentials}`
  // const redirectUri = 'http://localhost:5173/'
  const redirectUri = 'https://aws-project-anju.vercel.app/'
  const clearCodeFromURL = () => {
    searchParams.delete('code')
    setSearchParams(searchParams)
  }

  const handleSignOut = () => {
    sessionStorage.removeItem('access_token')
    setToken('')
    setUser({})
    const logoutUrl = `${cognitoDomain}/logout?client_id=${clientID}&logout_uri=${encodeURIComponent(
      redirectUri
    )}`
    window.location.href = logoutUrl
  }
  const handleLogin = () => {
    const loginUrl = `${cognitoDomain}/login?response_type=code&client_id=${clientID}&redirect_uri=${redirectUri}`
    window.location.href = loginUrl
  }

  useEffect(() => {
    const fetchData = async () => {
      if (!code) return

      const headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: basicAuthorization,
      }

      const data = new URLSearchParams()
      data.append('grant_type', 'authorization_code')
      data.append('client_id', clientID)
      data.append('code', code)
      data.append('redirect_uri', redirectUri)

      try {
        const response = await fetch(`${cognitoDomain}/oauth2/token`, {
          method: 'POST',
          headers: headers,
          body: data,
        })
        console.log(response)
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`)
        const result = await response.json()
        if (!result.access_token) throw new Error('No access token in response')
        const token = result.access_token
        setToken(token)
        sessionStorage.setItem('access_token', token)
        clearCodeFromURL()
      } catch (err) {
        console.error('Error fetching access token:', err)
      }
    }

    fetchData()
  }, [code]) // eslint-disable-line

  useEffect(() => {
    const fetchUserInfo = async () => {
      const storedToken = sessionStorage.getItem('access_token')
      if (!storedToken) return

      try {
        const userInfoResponse = await fetch(
          `${cognitoDomain}/oauth2/userInfo`,
          {
            headers: { Authorization: `Bearer ${storedToken}` },
          }
        )

        if (!userInfoResponse.ok) {
          throw new Error(`HTTP error! status: ${userInfoResponse.status}`)
        }
        const userInfo = await userInfoResponse.json()
        const response = await fetch('https://si1s14jr6i.execute-api.us-east-1.amazonaws.com/api/addUser', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userInfo),
        })
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`)
        const user = await response.json()
        console.log('user:', user.user)
        setUser({
          sub: user.user.sub,
          username: user.user.username,
          email: user.user.email,
          credit_balance: user.user.credit_balance,
          tier: user.user.tier,
        })
      } catch (err) {
        console.error('err:', err)
      }
    }

    fetchUserInfo()
  }, [token]) // eslint-disable-line

  return (
    <div className="w-screen h-screen bg-slate-50">
      {' '}
      <Navbar onSignOut={handleSignOut} onLogin={handleLogin} user={user} />
      <Routes>
        <Route
          path="/"
          element={
            user.username ? (
              <Home user={user} setUser={setUser} />
            ) : (
              <div className="w-full min-h-[calc(100vh-3.5rem)] flex items-center justify-center flex-col gap-6">
                <h1 className="text-2xl text-center mt-10">
                  Welcome to the Stock Sentiment App
                </h1>
                <p className="text-center mt-5">
                  Please{' '}
                  <button
                    className=" font-semibold text-blue-600 hover:text-blue-800"
                    onClick={handleLogin}>
                    login
                  </button>{' '}
                  to continue
                </p>
              </div>
            )
          }
        />
        <Route
          path="/upgrade"
          element={<Upgrade user={user} setUser={setUser} />}
        />
      </Routes>
    </div>
  )
}

export default App
