// useContext: Remove context
// 💯 caching in a context provider (exercise)
// http://localhost:3000/isolated/exercise/03.extra-2.tsx

import * as React from 'react'

import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'
import {useAsync} from '../utils'

import type {PokemonData} from '../types'

type PokemonCacheState = Record<string, PokemonData>

type PokemonCacheAction = {
  type: 'ADD_POKEMON'
  pokemonName: string
  pokemonData: PokemonData
}

function pokemonCacheReducer(
  state: PokemonCacheState,
  action: PokemonCacheAction,
) {
  switch (action.type) {
    case 'ADD_POKEMON': {
      return {...state, [action.pokemonName]: action.pokemonData}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

function PokemonSection({onSelect, pokemonName}) {
  const [cache, dispatch] = React.useReducer(pokemonCacheReducer, {})

  return (
    <div style={{display: 'flex'}}>
      <PreviousPokemon onSelect={onSelect} cache={cache} />
      <div className="pokemon-info" style={{marginLeft: 10}}>
        <PokemonErrorBoundary
          onReset={() => onSelect('')}
          resetKeys={[pokemonName]}
        >
          <PokemonInfo
            pokemonName={pokemonName}
            cache={cache}
            dispatchCacheUpdate={dispatch}
          />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

interface PokemonInfoProps {
  pokemonName: string
  cache: PokemonCacheState
  dispatchCacheUpdate: React.Dispatch<PokemonCacheAction>
}

function PokemonInfo({
  pokemonName,
  cache,
  dispatchCacheUpdate,
}: PokemonInfoProps) {
  const {data: pokemon, status, error, run, setData} = useAsync<PokemonData>()

  React.useEffect(() => {
    if (!pokemonName) {
      return
    } else if (cache[pokemonName]) {
      setData(cache[pokemonName])
    } else {
      run(
        fetchPokemon(pokemonName).then(pokemonData => {
          dispatchCacheUpdate({type: 'ADD_POKEMON', pokemonName, pokemonData})
          return pokemonData
        }),
      )
    }
  }, [cache, dispatchCacheUpdate, pokemonName, run, setData])

  switch (status) {
    case 'idle':
      return <span>Submit a pokemon</span>
    case 'pending':
      return <PokemonInfoFallback name={pokemonName} />
    case 'rejected':
      throw error
    case 'resolved':
      return <PokemonDataView pokemon={pokemon} />
    default:
      throw new Error('This should be impossible')
  }
}

interface ProviousPokemonProps {
  cache: PokemonCacheState
  onSelect: (name: string) => void
}

function PreviousPokemon({onSelect, cache}: ProviousPokemonProps) {
  return (
    <div>
      Previous Pokemon
      <ul style={{listStyle: 'none', paddingLeft: 0}}>
        {Object.keys(cache).map(pokemonName => (
          <li key={pokemonName} style={{margin: '4px auto'}}>
            <button
              style={{width: '100%'}}
              onClick={() => onSelect(pokemonName)}
            >
              {pokemonName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  const [pokemonName, setPokemonName] = React.useState(null)

  function handleSubmit(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  function handleSelect(newPokemonName: string) {
    setPokemonName(newPokemonName)
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <PokemonSection onSelect={handleSelect} pokemonName={pokemonName} />
    </div>
  )
}

export default App
