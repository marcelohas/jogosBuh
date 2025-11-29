import React, { useState, useEffect } from 'react';
import PokemonCard from './PokemonCard';

const BattleArena = ({ playerPokemon, opponentPokemon, onBattleEnd }) => {
    const [playerHP, setPlayerHP] = useState(playerPokemon.stats.hp);
    const [opponentHP, setOpponentHP] = useState(opponentPokemon.stats.hp);

    // Randomize start turn
    const [turn, setTurn] = useState(() => Math.random() < 0.5 ? 'player' : 'opponent');

    const [battleLog, setBattleLog] = useState([
        'Battle Start!',
        `${turn === 'player' ? 'You go' : 'Opponent goes'} first!`
    ]);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        if (playerHP <= 0) {
            setBattleLog(prev => [...prev, `${playerPokemon.name} fainted! You lose!`]);
            setIsFinished(true);
            setTimeout(() => onBattleEnd(false), 2000);
        } else if (opponentHP <= 0) {
            setBattleLog(prev => [...prev, `${opponentPokemon.name} fainted! You win!`]);
            setIsFinished(true);
            setTimeout(() => onBattleEnd(true), 2000);
        }
    }, [playerHP, opponentHP]);

    useEffect(() => {
        if (turn === 'opponent' && !isFinished) {
            const timer = setTimeout(() => {
                opponentAttack();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [turn, isFinished]);

    const calculateDamage = (attacker, defender) => {
        // Simple damage formula
        const damage = Math.floor((attacker.stats.attack / defender.stats.defense) * 10) + 5;
        return Math.max(1, damage);
    };

    const playerAttack = () => {
        if (turn !== 'player' || isFinished) return;

        const damage = calculateDamage(playerPokemon, opponentPokemon);
        setOpponentHP(prev => Math.max(0, prev - damage));
        setBattleLog(prev => [...prev, `${playerPokemon.name} dealt ${damage} damage!`]);
        setTurn('opponent');
    };

    const opponentAttack = () => {
        if (isFinished) return;

        const damage = calculateDamage(opponentPokemon, playerPokemon);
        setPlayerHP(prev => Math.max(0, prev - damage));
        setBattleLog(prev => [...prev, `${opponentPokemon.name} dealt ${damage} damage!`]);
        setTurn('player');
    };

    return (
        <div className="battle-arena container" style={{ maxWidth: '800px' }}>
            <div className="battle-field" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>

                {/* Player Side */}
                <div className="combatant player">
                    <PokemonCard pokemon={playerPokemon} />
                    <div className="hp-bar-container" style={{ marginTop: '1rem', background: '#333', borderRadius: '10px', height: '20px', overflow: 'hidden' }}>
                        <div
                            className="hp-bar"
                            style={{
                                width: `${(playerHP / playerPokemon.stats.hp) * 100}%`,
                                background: playerHP < playerPokemon.stats.hp * 0.2 ? 'red' : 'green',
                                height: '100%',
                                transition: 'width 0.5s ease'
                            }}
                        />
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{playerHP} / {playerPokemon.stats.hp} HP</p>
                </div>

                <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>VS</div>

                {/* Opponent Side */}
                <div className="combatant opponent">
                    <PokemonCard pokemon={opponentPokemon} />
                    <div className="hp-bar-container" style={{ marginTop: '1rem', background: '#333', borderRadius: '10px', height: '20px', overflow: 'hidden' }}>
                        <div
                            className="hp-bar"
                            style={{
                                width: `${(opponentHP / opponentPokemon.stats.hp) * 100}%`,
                                background: opponentHP < opponentPokemon.stats.hp * 0.2 ? 'red' : 'green',
                                height: '100%',
                                transition: 'width 0.5s ease'
                            }}
                        />
                    </div>
                    <p style={{ textAlign: 'center', marginTop: '0.5rem' }}>{opponentHP} / {opponentPokemon.stats.hp} HP</p>
                </div>
            </div>

            {/* Controls & Log */}
            <div className="battle-controls card" style={{ padding: '1rem' }}>
                <div className="actions" style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', justifyContent: 'center' }}>
                    <button
                        onClick={playerAttack}
                        disabled={turn !== 'player' || isFinished}
                        style={{ fontSize: '1.2rem', padding: '0.8rem 2rem', background: 'var(--type-fire)', color: 'white' }}
                    >
                        ATTACK
                    </button>
                    <button
                        disabled={true} // Placeholder for future feature
                        style={{ fontSize: '1.2rem', padding: '0.8rem 2rem', opacity: 0.5 }}
                    >
                        ITEM
                    </button>
                </div>

                <div className="battle-log" style={{
                    background: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '8px',
                    height: '150px',
                    overflowY: 'auto',
                    fontFamily: 'monospace'
                }}>
                    {battleLog.map((log, index) => (
                        <div key={index} style={{ marginBottom: '0.5rem' }}>{log}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default BattleArena;
