// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.tsx

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

type AsyncState<T extends unknown> =
  | {
      status: 'idle'
      data?: null
      error?: null
    }
  | {
      status: 'pending'
      data?: null
      error?: null
    }
  | {
      status: 'resolved'
      data: T
      error: null
    }
  | {
      status: 'rejected'
      data: null
      error: Error
    }

// 🦺 similar to above, this will need to be a generic type now and rename "pokemon" to "data"
// I'd also recommend renaming this
type AsyncAction<T extends unknown> =
  | {type: 'reset'}
  | {type: 'pending'}
  | {type: 'resolved'; data: T}
  | {type: 'rejected'; error: Error}

// 🐨 this is going to be our generic asyncReducer
// 🦺 make this function a generic that accepts a DataType and passes that to
// your AsyncState and AsyncAction types
function asyncReducer<T extends unknown>(
  state: AsyncState<T>,
  action: AsyncAction<T>,
): AsyncState<T> {
  switch (action.type) {
    case 'pending': {
      // 🐨 replace "pokemon" with "data"
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      // 🐨 replace "pokemon" with "data" (in the action too!)
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      // 🐨 replace "pokemon" with "data"
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useAsync<T>(
  asyncCallback: () => Promise<T>,
  deps: Array<unknown>,
): AsyncState<T> {
  const [state, dispatch] = React.useReducer<
    React.Reducer<AsyncState<T>, AsyncAction<T>>
  >(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
  })

  React.useEffect(() => {
    const promise = asyncCallback()
    if (!promise) {
      return
    }

    dispatch({type: 'pending'})
    promise.then(
      response => {
        dispatch({type: 'resolved', data: response})
      },
      error => {
        dispatch({type: 'rejected', error})
      },
    )
    // Will remove it in the future
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return state
}

function PokemonInfo({pokemonName}: {pokemonName: string}) {
  const state = useAsync(() => {
    if (!pokemonName) {
      return
    }
    return fetchPokemon(pokemonName)
  }, [pokemonName])
  const {data, status, error} = state

  switch (status) {
    case 'idle':
      return <span>Submit a pokemon</span>
    case 'pending':
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      throw error
    case 'resolved':
      return <PokemonDataView pokemon={data} />
    default:
      throw new Error('This should be impossible')
  }
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}
export default App
