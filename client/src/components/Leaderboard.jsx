import React, { useEffect, useState } from 'react';
import { getFaceitLevel, getLevelColor } from '../utils/faceit';

export default function Leaderboard({ socket, onBack }) {
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!socket) return;
        socket.emit("getLeaderboard", (data) => {
            setPlayers(data);
            setLoading(false);
        });
    }, [socket]);

    return (
        <div className="cs-container" style={{ textAlign: 'center' }}>
            <div className="cs-card" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'left' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1 className="cs-hero-title" style={{ margin: 0, border: 'none' }}>CLASSEMENT</h1>
                    <button className="cs-btn cs-btn-outline" onClick={onBack}>RETOUR</button>
                </div>

                {loading ? (
                    <div className="cs-spinner"></div>
                ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--cs-accent)', color: 'var(--cs-accent)' }}>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>#</th>
                                <th style={{ padding: '1rem', textAlign: 'left' }}>JOUEUR</th>
                                <th style={{ padding: '1rem', textAlign: 'center' }}>NIVEAU</th>
                                <th style={{ padding: '1rem', textAlign: 'right' }}>ELO</th>
                            </tr>
                        </thead>
                        <tbody>
                            {players.map((p, i) => {
                                const level = getFaceitLevel(p.elo);
                                const levelColor = getLevelColor(level);
                                
                                return (
                                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 'bold', color: i < 3 ? 'var(--cs-accent)' : '#fff' }}>
                                            {i + 1}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>
                                            {p.username}
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'center' }}>
                                            <div style={{ 
                                                display: 'inline-block',
                                                width: '30px', 
                                                height: '30px', 
                                                lineHeight: '30px',
                                                borderRadius: '50%', 
                                                backgroundColor: i === 0 ? '#ff0000' : (level >= 8 ? '#ff6b00' : (level >= 4 ? '#ffc800' : '#888')), // Simplification for better contrast
                                                color: '#000',
                                                fontWeight: 'bold',
                                                fontSize: '0.9rem'
                                            }}>
                                                {level}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem', textAlign: 'right', fontFamily: 'monospace', fontSize: '1.2rem' }}>
                                            {p.elo}
                                        </td>
                                    </tr>
                                )
                            })}
                            {players.length === 0 && (
                                <tr>
                                    <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--cs-text-muted)' }}>
                                        Aucun joueur classé pour le moment.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
