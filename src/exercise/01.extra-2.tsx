// useReducer: simulate setState with an object
// http://localhost:3000/isolated/exercise/01.extra-2.tsx

import * as React from 'react'

interface CountReducerState {
  count: number
}

const countReducer = (
  state: CountReducerState,
  newState: Partial<CountReducerState>,
): CountReducerState => ({
  ...state,
  ...newState,
})

function Counter({initialCount = 0, step = 1}) {
  const [state, setState] = React.useReducer(countReducer, {
    count: initialCount,
  })

  const {count} = state
  const increment = () => setState({count: count + step})
  const decrement = () => setState({count: count - step})

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
