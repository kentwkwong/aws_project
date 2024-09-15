import PropTypes from 'prop-types'
import { useState, useEffect } from 'react'

const Home = ({ user, setUser }) => {
  const [stockCode, setStockCode] = useState('')
  const [sentiment, setSentiment] = useState({
    result: '',
    sentiment_score: {},
  })
  const [isCreditBalanceZero, setIsCreditBalanceZero] = useState(false)
  console.log('isCreditBalanceZero: ', isCreditBalanceZero)
  const [searchHistory, setSearchHistory] = useState([])

  // console.log('searchHistory: ', searchHistory)

  const fetchSearchHistory = async () => {
    try {
      console.log('user.sub:', user.sub)
      const url = `http://localhost:8000/search/${user.sub}`

      const response = await fetch(url)
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      setSearchHistory(data.searchHistory)
    } catch (error) {
      console.error('Error:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = `http://localhost:8000/stockcode`

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stockCode, userId: user.sub }),
      })
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`)

      const data = await response.json()

      setSentiment({
        result: data.result.sentiment,
        sentiment_score: data.result.sentiment_score,
      })
      setStockCode('')

      setUser({
        ...user,
        credit_balance: data.updated_credit_balance,
      })

      // console.log(data)
      fetchSearchHistory()
    } catch (error) {
      console.error('Error:', error)
    }
  }

  useEffect(() => {
    if (user.credit_balance === 0) {
      setIsCreditBalanceZero(true)
    }
    setIsCreditBalanceZero(false)
  }, []) // eslint-disable-line

  useEffect(() => {
    fetchSearchHistory()
  }, []) // eslint-disable-line

  return (
    <div className="px-6 md:px-20 flex items-center min-h-[calc(100vh-3.5rem)] justify-center">
      <div className="  flex flex-col gap-6 p-6 bg-white shadow-lg rounded-lg">
        <form className=" flex gap-3 items-center " onSubmit={handleSubmit}>
          <label>Search stock</label>
          <input
            type="text"
            name="stockCode"
            placeholder="stock code"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            className=" border bg-white p-3 "
          />
          <button
            className={`${
              isCreditBalanceZero ? 'bg-gray-300' : 'bg-blue-600'
            } text-white p-2 rounded-lg`}
            disabled={isCreditBalanceZero}>
            Submit
          </button>
        </form>
        {isCreditBalanceZero && (
          <div className="text-red-500 font-bold">
            You don&apos;t have enough credit balance! Please upgrade your
            account.
          </div>
        )}
        <div>
          Sentiment result:{' '}
          <span className="text-green-600">{sentiment.result}</span>
        </div>
        {/* {sentiment.result && <div>{sentiment.sentiment_score}</div>} */}
        {searchHistory.length > 0 && (
          <div className=" flex flex-col gap-3">
            <h1 className=" font-bold">Search history:</h1>
            <table className=" table-auto border border-slate-400">
              <thead>
                <tr>
                  <th className="border border-slate-300">Stock code</th>
                  <th className="border border-slate-300">Date</th>
                  <th className="border border-slate-300">Sentiment</th>
                  <th className="border border-slate-300">Sentiment Score</th>
                </tr>
              </thead>
              <tbody>
                {searchHistory
                  .sort((a, b) => b.timestamp - a.timestamp)
                  .map((search, index) => (
                    <tr key={search.userId + '_' + index}>
                      <td className="border border-slate-300">
                        {search.stockCode}
                      </td>
                      <td className="border border-slate-300">
                        {new Date(search.timestamp * 1000)
                          .toLocaleDateString('en', {
                            year: '2-digit',
                            month: '2-digit',
                            day: '2-digit',
                          })
                          .replace(/\//g, '-')}
                      </td>

                      <td className="border border-slate-300">
                        {search.sentiment}
                      </td>
                      <td className="border border-slate-300">
                        {Object.entries(search.sentiment_score).map(
                          ([key, value]) => (
                            <span key={key} style={{ marginRight: '10px' }}>
                              {key}:{' '}
                              {typeof value === 'number'
                                ? value.toFixed(4)
                                : value}
                            </span>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

Home.propTypes = {
  setUser: PropTypes.func.isRequired,
  user: PropTypes.shape({
    sub: PropTypes.string,
    email: PropTypes.string,
    username: PropTypes.string,
    credit_balance: PropTypes.number,
    tier: PropTypes.number,
  }),
}

export default Home
