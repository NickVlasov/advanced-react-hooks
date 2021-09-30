// useCallback: avoid race conditions
// http://localhost:3000/isolated/exercise/02.extra-3.tsx

import * as React from 'react'
import {useCallback} from 'react'

import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'
import {PokemonData} from '../types'

type AsyncState<DataType> =
  | {
      status: 'idle'
      data?: null
      error?: null
      promise?: null
    }
  | {
      status: 'pending'
      data?: null
      error?: null
      promise: Promise<DataType>
    }
  | {
      status: 'resolved'
      data: DataType
      error: null
      promise: null
    }
  | {
      status: 'rejected'
      data: null
      error: Error
      promise: null
    }

type AsyncAction<DataType> =
  | {type: 'reset'}
  | {type: 'pending'; promise: Promise<DataType>}
  | {type: 'resolved'; data: DataType; promise: Promise<DataType>}
  | {type: 'rejected'; error: Error; promise: Promise<DataType>}

function asyncReducer<T extends unknown>(
  state: AsyncState<T>,
  action: AsyncAction<T>,
): AsyncState<T> {
  switch (action.type) {
    case 'pending': {
      return {
        status: 'pending',
        promise: action.promise,
        data: null,
        error: null,
      }
    }
    case 'resolved': {
      if (action.promise === state.promise) {
        return {
          status: 'resolved',
          promise: null,
          data: action.data,
          error: null,
        }
      }
      return state
    }
    case 'rejected': {
      if (action.promise === state.promise) {
        return {
          status: 'rejected',
          promise: null,
          data: null,
          error: action.error,
        }
      }

      return state
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
    dispatch({type: 'pending', promise})
    promise.then(
      response => {
        dispatch({type: 'resolved', data: response, promise})
      },
      error => {
        dispatch({type: 'rejected', error, promise})
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
    const pokemonPromise = fetchPokemon(pokemonName, {
      delay: Math.random() * 5000,
    })
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
