import { useNavigate } from 'react-router-dom'
import PropTypes from 'prop-types'
import { useEffect } from 'react'

const plans = [
  {
    _id: 1,
    name: 'Free',
    icon: '/free-plan.svg',
    price: 0,
    credits: 3,
    inclusions: [
      {
        label: '3 Free Credits per Day',
        isIncluded: true,
      },
      {
        label: 'Basic Access to Services',
        isIncluded: true,
      },
      {
        label: 'Priority Customer Support',
        isIncluded: false,
      },
      {
        label: 'Priority Updates',
        isIncluded: false,
      },
    ],
  },
  {
    _id: 2,
    name: 'Pro Package',
    icon: '/free-plan.svg',
    price: 20,
    credits: 20,
    inclusions: [
      {
        label: '20 Credits per Day',
        isIncluded: true,
      },
      {
        label: 'Full Access to Services',
        isIncluded: true,
      },
      {
        label: 'Priority Customer Support',
        isIncluded: true,
      },
      {
        label: 'Priority Updates',
        isIncluded: false,
      },
    ],
  },
  {
    _id: 3,
    name: 'Premium Package',
    icon: '/free-plan.svg',
    price: 99,
    credits: 100,
    inclusions: [
      {
        label: '100 Credits per Day',
        isIncluded: true,
      },
      {
        label: 'Full Access to Services',
        isIncluded: true,
      },
      {
        label: 'Priority Customer Support',
        isIncluded: true,
      },
      {
        label: 'Priority Updates',
        isIncluded: true,
      },
    ],
  },
]

const Upgrade = ({ user, setUser }) => {
  const navigate = useNavigate()
  useEffect(() => {
    !user.username && navigate('/')
  }, []) // eslint-disable-line

  const handleUpdateUser = async (id) => {
    try {
      const response = await fetch('http://localhost:8000/upgradeUser', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, userId: user.sub }),
      })
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)
      const data = await response.json()
      setUser({
        ...user,
        credit_balance: data.updated_credit_balance,
      })
      navigate('/')
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-3.5rem)] w-full items-center justify-center">
      <div className="text-center p-3">
        <h1 className="text-3xl font-semibold pb-3">Buy Credits</h1>
        <p className="text-lg">
          Choose a credit package that suits your needs!
        </p>
      </div>
      <section>
        <ul className="mt-11 items-center grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-9 xl:grid-cols-3">
          {plans.map((plan) => (
            <li
              key={plan.name}
              className="w-full text-center rounded-[16px] border-2 border-blue-200/20 bg-white p-8 shadow-xl shadow-purple-200/20 lg:max-w-none">
              <div className="flex flex-col gap-3 ">
                <p className="p-20-semibold mt-2 text-blue-500">{plan.name}</p>
                <p className="h1-semibold text-dark-600">${plan.price}</p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              {/* Inclusions */}
              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map((inclusion) => (
                  <li
                    key={plan.name + inclusion.label}
                    className="flex items-center gap-4">
                    <img
                      src={`${
                        inclusion.isIncluded ? '/check.svg' : '/cross.svg'
                      }`}
                      alt="Check"
                    />
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>

              {plan.name === 'Free' ? (
                <p className=" text-center py-2 ">Free Consumable</p>
              ) : (
                <button
                  className=" w-full py-2 rounded-full bg-blue-100 bg-cover text-blue-500 hover:text-blue-500"
                  onClick={() => handleUpdateUser(plan._id)}>
                  Upgrade
                </button>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

Upgrade.propTypes = {
  setUser: PropTypes.func.isRequired,
  user: PropTypes.shape({
    sub: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    credit_balance: PropTypes.number,
    tier: PropTypes.number,
  }),
}

export default Upgrade
