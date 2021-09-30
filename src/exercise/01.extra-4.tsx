// useReducer: traditional dispatch object with a type and switch statement
// http://localhost:3000/isolated/exercise/01.extra-4.tsx

import * as React from 'react'

interface CountReducerAction {
  type: 'increment' | 'decrement'
  step: number
}

interface CountReducerState {
  count: number
}

const countReducer = (
  state: CountReducerState,
  action: CountReducerAction,
): CountReducerState => {
  switch (action.type) {
    case 'increment':
      return {...state, count: state.count + 1}
    case 'decrement':
      return {...state, count: state.count - 1}
    default:
      return state
  }
}

function Counter({initialCount = 0, step = 1}) {
  const [state, dispatch] = React.useReducer(countReducer, {
    count: initialCount,
  })
  const {count} = state
  const increment = () => dispatch({type: 'increment', step})
  const decrement = () => dispatch({type: 'decrement', step})

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
