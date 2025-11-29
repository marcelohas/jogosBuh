const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (limit = 20, offset = 0) => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error('Error fetching Pokemon list:', error);
    return [];
  }
};

export const getPokemonDetails = async (nameOrId) => {
  try {
    const response = await fetch(`${BASE_URL}/pokemon/${nameOrId}`);
    const data = await response.json();

    // Format data for easier use
    return {
      id: data.id,
      name: data.name,
      types: data.types.map(t => t.type.name),
      sprites: {
        front_default: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
        front_shiny: data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny,
      },
      stats: data.stats.reduce((acc, stat) => {
        acc[stat.stat.name] = stat.base_stat;
        return acc;
      }, {}),
      height: data.height,
      weight: data.weight,
      abilities: data.abilities.map(a => a.ability.name),
    };
  } catch (error) {
    console.error(`Error fetching Pokemon details for ${nameOrId}:`, error);
    return null;
  }
};

export const getEvolutionDetails = async (pokemonName) => {
  try {
    // 1. Get Species
    const speciesRes = await fetch(`${BASE_URL}/pokemon-species/${pokemonName}`);
    const speciesData = await speciesRes.json();

    // 2. Get Evolution Chain
    const chainRes = await fetch(speciesData.evolution_chain.url);
    const chainData = await chainRes.json();

    // 3. Find current pokemon in chain and get next evolution
    let current = chainData.chain;
    let nextEvolution = null;

    // Recursive search for current pokemon to find its next evolution
    const findEvolution = (node) => {
      if (node.species.name === pokemonName) {
        if (node.evolves_to.length > 0) {
          nextEvolution = node.evolves_to[0].species.name;
        }
      } else {
        node.evolves_to.forEach(child => findEvolution(child));
      }
    };

    findEvolution(current);
    return nextEvolution;
  } catch (error) {
    console.error('Error fetching evolution:', error);
    return null;
  }
};
