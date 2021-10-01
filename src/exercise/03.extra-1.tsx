// useContext: create a consumer hook
// http://localhost:3000/isolated/exercise/03.extra-1.tsx

import * as React from 'react'
import {useContext, useState} from 'react'

type CountContextT =
  | [number, React.Dispatch<React.SetStateAction<number>>]
  | undefined

const CountContext = React.createContext<CountContextT>(undefined)

const CountProvider: React.FC = ({children}) => {
  const [count, setCount] = useState(0)

  return (
    <CountContext.Provider value={[count, setCount]}>
      {children}
    </CountContext.Provider>
  )
}

const useCountContext = () => {
  const context = useContext(CountContext)

  if (!context) {
    throw new Error(
      `Cannot get CountContext value. useCountContext should be wrapped in CountProvider`,
    )
  }

  return context
}

function CountDisplay() {
  const [count] = useCountContext()

  return <div>{`The current count is ${count}`}</div>
}

function Counter() {
  const [, setCount] = useCountContext()

  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>Increment count</button>
}

function App() {
  return (
    <div>
      <CountProvider>
        <CountDisplay />
        <Counter />
      </CountProvider>
    </div>
  )
}

export default App
