// useReducer: accept the step as the action
// http://localhost:3000/isolated/exercise/01.extra-1.tsx

import * as React from 'react'

const countReducer = (state: number, step: number) => state + step

function Counter({initialCount = 0, step = 1}) {
  const [count, changeCount] = React.useReducer(countReducer, initialCount)
  const increment = () => changeCount(step)
  const decrement = () => changeCount(-step)

  return (
    <div className="counter">
      <button onClick={decrement}>⬅️</button>
      {count}
      <button onClick={increment}>➡️</button>
    </div>
  )
}

function App() {
  return <Counter />
}

export default App
