// useCallback: return a memoized run function from useAsync
// http://localhost:3000/isolated/exercise/02.extra-2.tsx

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'
import {useCallback} from 'react'
import {PokemonData} from '../types'

type AsyncState<T> =
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

type AsyncAction<T> =
  | {type: 'reset'}
  | {type: 'pending'}
  | {type: 'resolved'; data: T}
  | {type: 'rejected'; error: Error}

function asyncReducer<T extends unknown>(
  state: AsyncState<T>,
  action: AsyncAction<T>,
): AsyncState<T> {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function useAsync<T>() {
  const [state, dispatch] = React.useReducer<
    React.Reducer<AsyncState<T>, AsyncAction<T>>
  >(asyncReducer, {
    status: 'idle',
    data: null,
    error: null,
  })

  const run = useCallback((promise: Promise<T>) => {
    dispatch({type: 'pending'})
    promise.then(
      response => {
        dispatch({type: 'resolved', data: response})
      },
      error => {
        dispatch({type: 'rejected', error})
      },
    )
  }, [])

  return {...state, run}
}

function PokemonInfo({pokemonName}: {pokemonName: string}) {
  const {data, status, error, run} = useAsync<PokemonData>()

  React.useEffect(() => {
    if (!pokemonName) {
      return
    }
    const pokemonPromise = fetchPokemon(pokemonName)
    run(pokemonPromise)
  }, [pokemonName, run])

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
