import React, { useState, useEffect } from 'react';
import { getPokemonList, getPokemonDetails, getEvolutionDetails } from './services/api';
import PokemonCard from './components/PokemonCard';
import BattleArena from './components/BattleArena';
import './App.css';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('pokedex'); // 'pokedex', 'battle', 'winner'
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [opponentPokemon, setOpponentPokemon] = useState(null);
  const [offset, setOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSelectingOpponent, setIsSelectingOpponent] = useState(false);
  const [winner, setWinner] = useState(null);

  const loadPokemon = async (currentOffset) => {
    if (currentOffset === 0) setLoading(true);
    else setLoadingMore(true);

    const list = await getPokemonList(12, currentOffset);
    const detailedList = await Promise.all(
      list.map(p => getPokemonDetails(p.name))
    );

    setPokemonList(prev => {
      // Avoid duplicates
      const existingIds = new Set(prev.map(p => p.id));
      const uniqueNew = detailedList.filter(p => !existingIds.has(p.id));
      return [...prev, ...uniqueNew];
    });
    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    loadPokemon(0);
  }, []);

  const handleLoadMore = () => {
    const newOffset = offset + 12;
    setOffset(newOffset);
    loadPokemon(newOffset);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.toLowerCase().trim();

    // 1. Check local list
    const localMatch = pokemonList.find(p => p.name === query || p.id.toString() === query);
    if (localMatch) {
      setSelectedPokemon(localMatch);
      setSearchQuery('');
      return;
    }

    // 2. Fetch from API
    setLoading(true);
    const result = await getPokemonDetails(query);
    setLoading(false);

    if (result) {
      setPokemonList(prev => {
        if (prev.some(p => p.id === result.id)) return prev;
        return [result, ...prev]; // Add to top
      });
      setSelectedPokemon(result);
      setSearchQuery('');
    } else {
      alert('Pokémon not found!');
    }
  };

  const handleSelectPokemon = (pokemon) => {
    if (isSelectingOpponent) {
      // Start battle with this opponent
      setOpponentPokemon(pokemon);
      setIsSelectingOpponent(false);
      startBattle(pokemon);
    } else {
      setSelectedPokemon(pokemon);
    }
  };

  const handleEvolve = async (pokemon) => {
    if (!pokemon) return;

    const originalName = pokemon.name;
    const nextEvolutionName = await getEvolutionDetails(originalName);

    if (nextEvolutionName) {
      const evolvedPokemon = await getPokemonDetails(nextEvolutionName);
      if (evolvedPokemon) {
        setPokemonList(prev => prev.map(p => p.id === pokemon.id ? evolvedPokemon : p));
        if (selectedPokemon?.id === pokemon.id) {
          setSelectedPokemon(evolvedPokemon);
        }
        alert(`${originalName} evolved into ${nextEvolutionName}!`);
      } else {
        alert(`Could not fetch data for ${nextEvolutionName}.`);
      }
    } else {
      alert(`${originalName} cannot evolve further!`);
    }
  };

  const startBattle = (opponent = null) => {
    setWinner(null);

    if (opponent) {
      // Opponent already selected
      setView('battle');
    } else {
      // Random opponent
      startRandomBattle();
    }
  };

  const startRandomBattle = async () => {
    const randomId = Math.floor(Math.random() * 151) + 1;
    const opponent = await getPokemonDetails(randomId);
    setOpponentPokemon(opponent);
    setView('battle');
  };

  const handleBattleEnd = (playerWon) => {
    setWinner(playerWon ? 'YOU' : 'OPPONENT');
    setView('winner');
  };

  return (
    <div className="app-container">
      <header style={{ textAlign: 'center', padding: '2rem 0' }}>
        <h1>POKÉMON BATTLE</h1>
      </header>

      <main className="container">
        {view === 'pokedex' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{ marginBottom: '1rem' }}>
                {isSelectingOpponent ? 'Choose Your Opponent' : 'Choose Your Partner'}
              </h2>

              {!isSelectingOpponent && (
                <form onSubmit={handleSearch} style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                  <input
                    type="text"
                    placeholder="Search Pokémon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      padding: '0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--text-muted)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-main)',
                      fontSize: '1rem',
                      width: '300px'
                    }}
                  />
                  <button type="submit" style={{ background: 'var(--secondary)', color: 'white' }}>
                    SEARCH
                  </button>
                </form>
              )}

              {isSelectingOpponent ? (
                <button
                  onClick={() => setIsSelectingOpponent(false)}
                  style={{
                    background: 'var(--type-fire)',
                    color: 'white',
                    marginBottom: '1rem'
                  }}
                >
                  CANCEL SELECTION
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button
                    onClick={() => startBattle(null)}
                    disabled={!selectedPokemon}
                    style={{
                      opacity: selectedPokemon ? 1 : 0.5,
                      transform: selectedPokemon ? 'scale(1.05)' : 'scale(1)',
                      background: 'var(--primary)',
                      color: 'black'
                    }}
                  >
                    BATTLE RANDOM
                  </button>
                  <button
                    onClick={() => setIsSelectingOpponent(true)}
                    disabled={!selectedPokemon}
                    style={{
                      opacity: selectedPokemon ? 1 : 0.5,
                      transform: selectedPokemon ? 'scale(1.05)' : 'scale(1)',
                      background: 'var(--secondary)',
                      color: 'white'
                    }}
                  >
                    SELECT OPPONENT
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <div className="flex-center" style={{ height: '200px' }}>Loading Pokedex...</div>
            ) : (
              <>
                <div className="grid-auto">
                  {pokemonList.map(pokemon => (
                    <PokemonCard
                      key={pokemon.id}
                      pokemon={pokemon}
                      onClick={handleSelectPokemon}
                      isSelected={selectedPokemon?.id === pokemon.id}
                      onEvolve={!isSelectingOpponent ? handleEvolve : undefined}
                    />
                  ))}
                </div>
                <div className="flex-center" style={{ marginTop: '2rem' }}>
                  <button
                    onClick={handleLoadMore}
                    disabled={loadingMore}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--text-muted)',
                      color: 'var(--text-main)'
                    }}
                  >
                    {loadingMore ? 'Loading...' : 'LOAD MORE POKÉMON'}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {view === 'battle' && opponentPokemon && (
          <BattleArena
            playerPokemon={selectedPokemon}
            opponentPokemon={opponentPokemon}
            onBattleEnd={handleBattleEnd}
          />
        )}

        {view === 'winner' && (
          <div className="winner-screen flex-center" style={{ flexDirection: 'column', height: '50vh' }}>
            <h2 style={{ fontSize: '3rem', color: winner === 'YOU' ? 'var(--type-grass)' : 'var(--type-fire)', marginBottom: '2rem' }}>
              {winner === 'YOU' ? 'YOU WON!' : 'YOU LOST!'}
            </h2>
            <button
              onClick={() => setView('pokedex')}
              style={{ fontSize: '1.5rem', padding: '1rem 3rem', background: 'var(--primary)', color: 'black' }}
            >
              PLAY AGAIN
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
