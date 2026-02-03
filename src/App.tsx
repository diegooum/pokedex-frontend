import { useEffect, useState } from 'react';
import axios from 'axios';
import { 
  Radar, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer 
} from 'recharts';

// --- INTERFACES ---
interface PokemonSummary {
  id: number;
  name: string;
  image: string;
}

interface PokemonDetail extends PokemonSummary {
  types: string[];
  cry: string;
  stats: { name: string; value: number }[];
  descriptions: { [key: string]: string };
  evolutions: { id: number; name: string; image: string }[];
}

// --- CONFIGURACIÓN ESTÉTICA ---
// Colores de tipos (Mantenemos estos porque son estándar)
const typeColors: { [key: string]: string } = {
  fire: 'bg-orange-500', water: 'bg-blue-500', grass: 'bg-green-500',
  electric: 'bg-yellow-400', psychic: 'bg-pink-500', ice: 'bg-cyan-300',
  dragon: 'bg-indigo-600', dark: 'bg-slate-700', fairy: 'bg-pink-400',
  normal: 'bg-slate-400', fighting: 'bg-red-700', flying: 'bg-sky-400',
  poison: 'bg-purple-500', ground: 'bg-amber-600', rock: 'bg-stone-600',
  bug: 'bg-lime-500', ghost: 'bg-violet-800', steel: 'bg-slate-500',
};

// Abreviaciones técnicas para el gráfico
const statShortNames: { [key: string]: string } = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SPA', 'special-defense': 'SPD', speed: 'SPE',
};

// Si estamos en tu compu, usa localhost. Si estamos en la nube, usa la URL de Render.
const API_URL = import.meta.env.VITE_API_URL || 'https://pokedex-backend-6zqs.onrender.com';

function App() {
  // --- ESTADOS ---
  const [pokemons, setPokemons] = useState<PokemonSummary[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [language, setLanguage] = useState('es'); 
  const [isFavorite, setIsFavorite] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Control de UI
  const [offset, setOffset] = useState(0); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isSearching, setIsSearching] = useState(false); 
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [isRetro, setIsRetro] = useState(false); 
  
  // Battle Mode
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [contenders, setContenders] = useState<PokemonDetail[]>([]);

  // --- EFECTOS ---
  
  // Carga inicial
  useEffect(() => {
    loadPokemons(0);
  }, []);

  // ⚡ BÚSQUEDA EN VIVO (DEBOUNCE)
  useEffect(() => {
    // Si limpiamos el buscador, volvemos a la lista normal
    if (searchTerm.trim() === '') {
      if (isSearching) {
        setIsSearching(false);
        loadPokemons(0);
      }
      return;
    }

    // Esperamos 500ms antes de disparar la búsqueda
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await axios.get(`${API_URL}/pokemon/search/${searchTerm.toLowerCase()}`);
        setPokemons(data);
      } catch (error) {
        console.error("Búsqueda sin resultados", error);
        setPokemons([]); 
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);


  // --- FUNCIONES LOGICAS ---

  const loadPokemons = async (currentOffset: number) => {
    try {
      const { data } = await axios.get(`${API_URL}/pokemon?limit=20&offset=${currentOffset}`);
      if (currentOffset === 0) {
        setPokemons(data);
      } else {
        setPokemons((prev) => [...prev, ...data]);
      }
      setOffset(currentOffset + 20); 
    } catch (error) { console.error(error); }
  };

  const showFavorites = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/pokemon/favorites/all`);
      setPokemons(data); 
      setViewMode('favorites'); 
      setOffset(0); 
    } catch (error) { console.error(error); }
  };

  const showAll = () => {
    setViewMode('all');
    setSearchTerm('');
    loadPokemons(0); 
  };

  const filterByType = async (type: string) => {
    setIsSearching(true); 
    setSearchTerm(''); 
    try {
      const { data } = await axios.get(`${API_URL}/pokemon/type/${type}`);
      setPokemons(data);
    } catch (error) { console.error(error); }
  };

  const fetchPokemonDetail = async (id: number) => {
      try {
        setRecommendations([]); 
        const { data } = await axios.get(`${API_URL}/pokemon/${id}`);
        setSelectedPokemon(data);
        setIsFavorite(false); 
        
        // Carga silenciosa de recomendaciones
        axios.get(`${API_URL}/pokemon/${id}/recommendations`).then(res => {
          setRecommendations(res.data);
        });

      } catch (error) { console.error(error); }
  };

  const toggleFavorite = async () => {
      if (!selectedPokemon) return;
      try {
        await axios.post(`${API_URL}/pokemon/favorite/${selectedPokemon.id}`);
        setIsFavorite(!isFavorite); 
      } catch (error) { console.error("Error favoritos", error); }
  };

  const playCry = () => {
      if (selectedPokemon?.cry) {
        const audio = new Audio(selectedPokemon.cry);
        audio.volume = 0.5;
        audio.play();
      }
  };

  // Lógica de Selección para Batalla
  const handlePokemonClick = async (id: number) => {
    if (!isBattleMode) {
      fetchPokemonDetail(id);
      return;
    }
    try {
      const { data } = await axios.get(`${API_URL}/pokemon/${id}`);
      setContenders((prev) => {
        const newList = [...prev, data];
        if (newList.length > 2) return [data]; 
        return newList;
      });
    } catch (error) { console.error(error); }
  };

  const exitBattleMode = () => {
    setIsBattleMode(false);
    setContenders([]);
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-red-500 selection:text-white">
      
      {/* 🔴 HEADER PROFESIONAL */}
      <header className="bg-red-600 shadow-xl border-b-4 border-red-800 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
             {/* Simulación de la luz azul de la Pokedex */}
            <div className="w-10 h-10 bg-sky-400 rounded-full border-4 border-white shadow-[0_0_15px_rgba(56,189,248,0.8)] animate-pulse"></div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase italic">
              Pokédex<span className="text-red-200"></span>
            </h1>
          </div>
          
          {/* Barra de herramientas superior */}
          <div className="flex gap-2">
            <button 
              onClick={() => setIsRetro(!isRetro)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${isRetro ? 'bg-purple-900 border-purple-500 text-purple-200' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}
            >
              {isRetro ? '8-Bit' : 'HD'}
            </button>
            <button 
              onClick={() => { setIsBattleMode(!isBattleMode); setContenders([]); }} 
              className={`px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider transition-all border ${isBattleMode ? 'bg-orange-600 border-orange-400 text-white' : 'bg-slate-800 border-slate-600 text-slate-400 hover:text-white'}`}
            >
              {isBattleMode ? 'En Combate' : 'Comparar'}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8">
        
        {/* ⚙️ BARRA DE CONTROL PRINCIPAL */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-lg">
          
          {/* Tabs de Vista */}
          <div className="flex bg-slate-900 p-1 rounded-lg">
            <button 
              onClick={showAll} 
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'all' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Registro Global
            </button>
            <button 
              onClick={showFavorites} 
              className={`px-6 py-2 rounded-md text-sm font-bold transition-all ${viewMode === 'favorites' ? 'bg-red-600 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Mis Favoritos
            </button>
          </div>

          {/* Buscador en Vivo */}
          <div className="relative w-full md:w-96">
            <input 
              type="text" 
              placeholder="Buscar por nombre o ID..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-2.5 text-slate-500 hover:text-white">✕</button>
            )}
          </div>
        </div>

        {/* 🏷️ FILTROS POR TIPO (Diseño Minimalista) */}
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {Object.keys(typeColors).map((type) => (
            <button
              key={type}
              onClick={() => filterByType(type)}
              className={`${typeColors[type]} px-3 py-1 rounded text-[10px] font-bold uppercase text-white tracking-widest hover:opacity-80 transition-opacity border border-white/10`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* 📦 GRILLA DE TARJETAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
          {pokemons.map((poke) => {
            const selectionIndex = contenders.findIndex(c => c.id === poke.id);
            const isSelected = selectionIndex !== -1;
            const borderClass = selectionIndex === 0 ? 'border-blue-500 ring-2 ring-blue-500/50' : selectionIndex === 1 ? 'border-red-500 ring-2 ring-red-500/50' : 'border-slate-700 hover:border-slate-500';

            return (
              <div key={poke.id} onClick={() => handlePokemonClick(poke.id)}
                className={`bg-slate-800 rounded-xl p-4 flex flex-col items-center shadow-lg transition-all cursor-pointer border relative group overflow-hidden ${isSelected ? borderClass : borderClass}`}>
                
                {/* Fondo decorativo */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700"></div>

                {isSelected && (
                  <div className={`absolute top-3 right-3 w-6 h-6 rounded flex items-center justify-center text-xs font-bold text-white ${selectionIndex === 0 ? 'bg-blue-600' : 'bg-red-600'}`}>
                    P{selectionIndex + 1}
                  </div>
                )}

                <div className="bg-slate-900/50 rounded-full p-4 mb-3 border border-slate-700/50 group-hover:bg-slate-700/50 transition-colors">
                  <img 
                    src={isRetro 
                      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png` 
                      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`
                    } 
                    alt={poke.name} 
                    className={`object-contain drop-shadow-xl transition-all duration-300 ${isRetro ? 'w-20 h-20 rendering-pixelated' : 'w-28 h-28'}`} 
                    style={{ imageRendering: isRetro ? 'pixelated' : 'auto' }} 
                  />
                </div>
                
                <span className="text-slate-500 text-xs font-mono mb-1">ID: {poke.id.toString().padStart(4, '0')}</span>
                <h3 className="text-lg font-bold capitalize text-slate-200">{poke.name}</h3>
              </div>
            );
          })}
        </div>

        {/* BOTÓN CARGAR MÁS */}
        {!isSearching && viewMode === 'all' && (
          <div className="flex justify-center border-t border-slate-800 pt-8">
            <button 
              onClick={() => loadPokemons(offset)}
              className="bg-slate-800 hover:bg-red-600 hover:text-white text-slate-400 font-medium py-2 px-8 rounded-full border border-slate-600 transition-all text-sm uppercase tracking-wide"
            >
              Cargar Siguientes
            </button>
          </div>
        )}

      </main>

      {/* 🖥️ MODAL DETALLE (Layout Profesional) */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-sm flex justify-center items-center z-50 p-4" onClick={() => setSelectedPokemon(null)}>
          <div className="bg-slate-900 rounded-lg max-w-5xl w-full border border-slate-700 shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            
            {/* COLUMNA IZQUIERDA: Visual */}
            <div className="p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 md:w-5/12 border-b md:border-b-0 md:border-r border-slate-700 relative">
               <img 
                src={isRetro 
                  ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png` 
                  : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`
                } 
                className={`object-contain drop-shadow-2xl animate-fade-in ${isRetro ? 'w-48 h-48 rendering-pixelated' : 'w-64 h-64'}`} 
                style={{ imageRendering: isRetro ? 'pixelated' : 'auto' }}
              />
              
              <div className="flex gap-2 mt-6">
                {selectedPokemon.types.map(t => (
                  <span key={t} className={`${typeColors[t] || 'bg-slate-500'} px-3 py-1 rounded text-xs font-bold uppercase text-white shadow-sm`}>{t}</span>
                ))}
              </div>

              <button 
                onClick={playCry} 
                className="mt-8 text-slate-400 hover:text-red-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 border border-slate-700 px-4 py-2 rounded hover:border-red-400 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"></path></svg>
                Reproducir Sonido
              </button>
            </div>
            
            {/* COLUMNA DERECHA: Datos */}
            <div className="p-8 md:w-7/12 flex flex-col overflow-y-auto">
              
              {/* Header Ficha */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-black text-white capitalize flex items-center gap-3">
                    {selectedPokemon.name}
                    <button onClick={toggleFavorite} className="focus:outline-none transition-transform active:scale-95">
                      {/* Corazón SVG */}
                      <svg className={`w-8 h-8 ${isFavorite ? 'text-red-600 fill-current' : 'text-slate-600 hover:text-red-600'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </button>
                  </h2>
                  <span className="text-slate-500 font-mono text-sm">#{selectedPokemon.id.toString().padStart(4, '0')}</span>
                </div>
                
                {/* Selector Idioma */}
                <div className="flex bg-slate-800 rounded border border-slate-700">
                  {['es', 'en', 'de'].map(lang => (
                    <button 
                      key={lang}
                      onClick={() => setLanguage(lang)} 
                      className={`px-3 py-1 text-xs font-bold uppercase ${language === lang ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              {/* 🧬 EVOLUCIONES (Top) */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Secuencia Evolutiva</h3>
                <div className="flex items-center gap-4 bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                  {selectedPokemon.evolutions.map((evo, index) => (
                    <div key={evo.id} className="flex items-center gap-3">
                      {index > 0 && <span className="text-slate-600 text-lg">›</span>}
                      <div 
                        onClick={() => fetchPokemonDetail(evo.id)} 
                        className={`cursor-pointer flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity ${selectedPokemon.id === evo.id ? 'opacity-100' : ''}`}
                      >
                        <img src={evo.image} alt={evo.name} className="w-10 h-10 object-contain" />
                        <span className={`text-[10px] font-bold capitalize ${selectedPokemon.id === evo.id ? 'text-red-400' : 'text-slate-400'}`}>
                          {evo.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <p className="text-slate-300 text-sm leading-relaxed mb-6 border-l-2 border-red-600 pl-4 italic">
                "{selectedPokemon.descriptions[language] || 'Sin datos disponibles.'}"
              </p>

              {/* 📊 GRÁFICO RADAR */}
              <div className="h-64 w-full relative border-t border-slate-800 pt-4 mt-4">
                 <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 absolute top-4 left-0">Estadísticas Base</h3>
                 <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="55%" outerRadius="75%" data={selectedPokemon.stats}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis 
                      dataKey="name" 
                      tickFormatter={(val) => {
                        const value = selectedPokemon.stats.find(s => s.name === val)?.value;
                        const shortName = statShortNames[val] || val;
                        return `${shortName} ${value}`;
                      }} 
                      tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                    <Radar name={selectedPokemon.name} dataKey="value" stroke="#ef4444" strokeWidth={2} fill="#ef4444" fillOpacity={0.2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 🤖 IA RECOMENDACIONES */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                   Similitud Biómétrica <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[9px] text-slate-400">Algoritmo KNN</span>
                </h3>
                
                {recommendations.length === 0 ? (
                  <div className="text-slate-600 text-xs italic">Calculando vectores...</div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {recommendations.map((rec) => (
                      <div key={rec.id} onClick={() => fetchPokemonDetail(rec.id)} className="bg-slate-800 hover:bg-slate-700 p-2 rounded border border-slate-700 hover:border-slate-500 cursor-pointer transition-all group text-center">
                        <img src={rec.image} className="w-8 h-8 object-contain mx-auto mb-1 opacity-70 group-hover:opacity-100" />
                        <p className="text-[10px] font-bold text-slate-300 capitalize">{rec.name}</p>
                        <p className="text-[9px] text-slate-500">Diff: {Math.round(rec.distance)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

      {/* 🏟️ MODAL COMPARACIÓN (VERSUS) */}
      {contenders.length === 2 && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={exitBattleMode}>
          <div className="bg-slate-900 rounded-xl max-w-5xl w-full border border-slate-700 shadow-2xl relative overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            <button onClick={exitBattleMode} className="absolute top-4 right-4 text-slate-500 hover:text-white z-10">✕</button>

            <div className="flex flex-col md:flex-row h-full">
              
              {/* P1 */}
              <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-900 border-r border-slate-800">
                <h2 className="text-2xl font-black text-blue-500 capitalize mb-4">{contenders[0].name}</h2>
                <img src={contenders[0].image} className="w-40 h-40 object-contain" />
                <div className="text-3xl font-black text-white mt-6">{contenders[0].stats.reduce((acc, s) => acc + s.value, 0)} <span className="text-xs font-bold text-slate-500 uppercase">Total Stats</span></div>
              </div>

              {/* GRÁFICO VS */}
              <div className="flex-1 p-4 flex flex-col items-center justify-center relative bg-slate-900/50">
                <div className="absolute top-4 text-xs font-bold text-slate-600 uppercase tracking-widest">Comparativa de Rendimiento</div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="70%" data={contenders[0].stats.map((s, i) => ({
                      subject: statShortNames[s.name] || s.name,
                      A: s.value,
                      B: contenders[1].stats[i].value,
                    }))}>
                      <PolarGrid stroke="#334155" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontWeight: 'bold', fontSize: 11 }} />
                      <PolarRadiusAxis angle={30} domain={[0, 150]} tick={false} axisLine={false} />
                      <Radar name={contenders[0].name} dataKey="A" stroke="#3b82f6" strokeWidth={3} fill="#3b82f6" fillOpacity={0.1} />
                      <Radar name={contenders[1].name} dataKey="B" stroke="#ef4444" strokeWidth={3} fill="#ef4444" fillOpacity={0.1} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* P2 */}
              <div className="flex-1 p-8 flex flex-col items-center justify-center bg-slate-900 border-l border-slate-800">
                <h2 className="text-2xl font-black text-red-500 capitalize mb-4">{contenders[1].name}</h2>
                <img src={contenders[1].image} className="w-40 h-40 object-contain" />
                <div className="text-3xl font-black text-white mt-6">{contenders[1].stats.reduce((acc, s) => acc + s.value, 0)} <span className="text-xs font-bold text-slate-500 uppercase">Total Stats</span></div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;