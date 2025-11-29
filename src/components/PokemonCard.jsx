import React from 'react';

const PokemonCard = ({ pokemon, onClick, isSelected, onEvolve }) => {
    if (!pokemon) return null;

    return (
        <div
            className={`card pokemon-card ${isSelected ? 'selected' : ''}`}
            onClick={() => onClick && onClick(pokemon)}
            style={{
                cursor: onClick ? 'pointer' : 'default',
                borderColor: isSelected ? 'var(--primary)' : 'transparent',
                borderWidth: isSelected ? '2px' : '1px',
                position: 'relative'
            }}
        >
            <div className="card-image-container flex-center">
                <img
                    src={pokemon.sprites.front_default}
                    alt={pokemon.name}
                    className="pokemon-image"
                    style={{ width: '150px', height: '150px', objectFit: 'contain' }}
                />
            </div>

            <h3 style={{ textTransform: 'capitalize', textAlign: 'center', marginTop: '1rem' }}>
                {pokemon.name}
            </h3>

            <div className="types-container flex-center" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                {pokemon.types.map(type => (
                    <span
                        key={type}
                        style={{
                            backgroundColor: `var(--type-${type})`,
                            padding: '0.25rem 0.75rem',
                            borderRadius: '20px',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            textTransform: 'capitalize',
                            color: '#fff',
                            textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                        }}
                    >
                        {type}
                    </span>
                ))}
            </div>

            <div className="stats-container" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                <div className="stat-item">
                    <span>HP:</span> <span style={{ color: 'var(--text-main)' }}>{pokemon.stats.hp}</span>
                </div>
                <div className="stat-item">
                    <span>ATK:</span> <span style={{ color: 'var(--text-main)' }}>{pokemon.stats.attack}</span>
                </div>
                <div className="stat-item">
                    <span>DEF:</span> <span style={{ color: 'var(--text-main)' }}>{pokemon.stats.defense}</span>
                </div>
                <div className="stat-item">
                    <span>SPD:</span> <span style={{ color: 'var(--text-main)' }}>{pokemon.stats.speed}</span>
                </div>
            </div>

            {onEvolve && isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEvolve(pokemon);
                    }}
                    style={{
                        marginTop: '1rem',
                        width: '100%',
                        background: 'linear-gradient(45deg, var(--primary), var(--accent))',
                        color: 'black',
                        border: 'none',
                        fontWeight: 'bold'
                    }}
                >
                    EVOLVE
                </button>
            )}
        </div>
    );
};

export default PokemonCard;
