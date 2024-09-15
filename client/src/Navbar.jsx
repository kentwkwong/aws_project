import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

const Navbar = ({ onSignOut, onLogin, user }) => {
  return (
    <nav className="px-6 md:px-20  py-2 fix w-full flex gap-6 bg-white h-14  shadow-xl items-center justify-between">
      <div>
        {user.email ? (
          <div className="flex gap-5 items-center">
            <Link to="/">
              Welcome, {user.username} (Credit: {user.credit_balance})
            </Link>
            <Link
              to="/upgrade"
              className="bg-blue-600 text-white p-2 rounded-md">
              Upgrade
            </Link>
          </div>
        ) : (
          'Welcome'
        )}
      </div>
      <div>
        {!user.username ? (
          <button
            className=" bg-blue-600 text-white p-2  rounded-md"
            onClick={onLogin}>
            Login
          </button>
        ) : (
          <button
            className=" bg-blue-600 text-white p-2  rounded-md"
            onClick={onSignOut}>
            Sign Out
          </button>
        )}
      </div>
    </nav>
  )
}

Navbar.propTypes = {
  onSignOut: PropTypes.func.isRequired,
  onLogin: PropTypes.func.isRequired,

  user: PropTypes.shape({
    email: PropTypes.string,
    username: PropTypes.string,
    credit_balance: PropTypes.number,
    tier: PropTypes.number,
  }),
}

export default Navbar
