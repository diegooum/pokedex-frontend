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

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
}

interface TeamAnalysis {
  teamName: string;
  averageStats: {
    hp: number; attack: number; defense: number; 
    spAttack: number; spDefense: number; speed: number;
  };
  typeDistribution: { [key: string]: number };
  warnings: string[];
  mvp: {
    name: string;
    image: string;
    totalStats: number;
  };
}

// --- TRADUCCIONES ---
const translations = {
  es: {
    pokedex: 'POKÉDEX',
    digitalEncyclopedia: 'ENCICLOPEDIA DIGITAL',
    logout: 'SALIR',
    login: 'INGRESAR',
    all: 'TODOS',
    favorites: 'FAVORITOS',
    searchPlaceholder: 'Buscar Pokémon...',
    filterByType: 'Filtrar por Tipo',
    addToTeam: '+ EQUIPO',
    loadMore: 'Cargar más Pokémon',
    myTeam: 'MI EQUIPO',
    analyze: 'ANALIZAR',
    analyzing: 'ANALIZANDO...',
    teamAnalysis: 'ANÁLISIS DE EQUIPO',
    poweredByAI: 'Powered by AI',
    mvp: 'JUGADOR MÁS VALIOSO',
    totalStats: 'ESTADÍSTICAS TOTALES',
    teamBalance: 'Balance del Equipo',
    diagnosis: 'Diagnóstico',
    typeComposition: 'Composición de Tipos',
    signIn: 'INICIAR SESIÓN',
    createAccount: 'CREAR CUENTA',
    enterData: 'Ingresa tus datos',
    registerTrainer: 'Regístrate como entrenador',
    trainerName: 'Nombre de Entrenador',
    email: 'Correo Electrónico',
    password: 'Contraseña',
    enter: 'ENTRAR',
    register: 'REGISTRARSE',
    noAccount: '¿No tienes cuenta? Regístrate',
    hasAccount: '¿Ya tienes cuenta? Inicia sesión',
    sound: 'SONIDO',
    favorite: '♥ FAVORITO',
    save: '♡ GUARDAR',
    evolutionChain: 'Cadena Evolutiva',
    baseStats: 'Estadísticas Base',
    similarPokemon: 'Pokémon Similares (KNN)',
    calculating: 'Calculando...',
    distance: 'Dist',
    pokemonBattle: 'BATALLA POKÉMON',
    player: 'JUGADOR',
    total: 'TOTAL',
    comparison: 'Comparación',
    teamFull: 'Equipo lleno - Máximo 6 Pokémon',
    exitBattle: 'SALIR VS',
    battle: 'BATALLA',
    noDescription: 'Sin descripción',
  },
  en: {
    pokedex: 'POKÉDEX',
    digitalEncyclopedia: 'DIGITAL ENCYCLOPEDIA',
    logout: 'LOGOUT',
    login: 'LOGIN',
    all: 'ALL',
    favorites: 'FAVORITES',
    searchPlaceholder: 'Search Pokémon...',
    filterByType: 'Filter by Type',
    addToTeam: '+ TEAM',
    loadMore: 'Load more Pokémon',
    myTeam: 'MY TEAM',
    analyze: 'ANALYZE',
    analyzing: 'ANALYZING...',
    teamAnalysis: 'TEAM ANALYSIS',
    poweredByAI: 'Powered by AI',
    mvp: 'MOST VALUABLE PLAYER',
    totalStats: 'TOTAL STATS',
    teamBalance: 'Team Balance',
    diagnosis: 'Diagnosis',
    typeComposition: 'Type Composition',
    signIn: 'SIGN IN',
    createAccount: 'CREATE ACCOUNT',
    enterData: 'Enter your credentials',
    registerTrainer: 'Register as trainer',
    trainerName: 'Trainer Name',
    email: 'Email',
    password: 'Password',
    enter: 'ENTER',
    register: 'REGISTER',
    noAccount: "Don't have an account? Sign up",
    hasAccount: 'Already have an account? Sign in',
    sound: 'SOUND',
    favorite: '♥ FAVORITE',
    save: '♡ SAVE',
    evolutionChain: 'Evolution Chain',
    baseStats: 'Base Stats',
    similarPokemon: 'Similar Pokémon (KNN)',
    calculating: 'Calculating...',
    distance: 'Dist',
    pokemonBattle: 'POKÉMON BATTLE',
    player: 'PLAYER',
    total: 'TOTAL',
    comparison: 'Comparison',
    teamFull: 'Team full - Max 6 Pokémon',
    exitBattle: 'EXIT VS',
    battle: 'BATTLE',
    noDescription: 'No description available',
  },
  de: {
    pokedex: 'POKÉDEX',
    digitalEncyclopedia: 'DIGITALE ENZYKLOPÄDIE',
    logout: 'ABMELDEN',
    login: 'ANMELDEN',
    all: 'ALLE',
    favorites: 'FAVORITEN',
    searchPlaceholder: 'Pokémon suchen...',
    filterByType: 'Nach Typ filtern',
    addToTeam: '+ TEAM',
    loadMore: 'Mehr Pokémon laden',
    myTeam: 'MEIN TEAM',
    analyze: 'ANALYSIEREN',
    analyzing: 'ANALYSIERE...',
    teamAnalysis: 'TEAM-ANALYSE',
    poweredByAI: 'Unterstützt von KI',
    mvp: 'WERTVOLLSTER SPIELER',
    totalStats: 'GESAMTSTATISTIKEN',
    teamBalance: 'Team-Balance',
    diagnosis: 'Diagnose',
    typeComposition: 'Typ-Zusammensetzung',
    signIn: 'ANMELDEN',
    createAccount: 'KONTO ERSTELLEN',
    enterData: 'Geben Sie Ihre Daten ein',
    registerTrainer: 'Als Trainer registrieren',
    trainerName: 'Trainername',
    email: 'E-Mail',
    password: 'Passwort',
    enter: 'EINTRETEN',
    register: 'REGISTRIEREN',
    noAccount: 'Kein Konto? Registrieren',
    hasAccount: 'Bereits ein Konto? Anmelden',
    sound: 'TON',
    favorite: '♥ FAVORIT',
    save: '♡ SPEICHERN',
    evolutionChain: 'Evolutionskette',
    baseStats: 'Basis-Statistiken',
    similarPokemon: 'Ähnliche Pokémon (KNN)',
    calculating: 'Berechnung läuft...',
    distance: 'Abst',
    pokemonBattle: 'POKÉMON-KAMPF',
    player: 'SPIELER',
    total: 'GESAMT',
    comparison: 'Vergleich',
    teamFull: 'Team voll - Max 6 Pokémon',
    exitBattle: 'KAMPF BEENDEN',
    battle: 'KAMPF',
    noDescription: 'Keine Beschreibung verfügbar',
  },
};

// --- CONFIGURACIÓN ESTÉTICA ---
const typeColors: { [key: string]: string } = {
  fire: 'bg-orange-500', water: 'bg-blue-500', grass: 'bg-green-600',
  electric: 'bg-yellow-400', psychic: 'bg-pink-500', ice: 'bg-cyan-400',
  dragon: 'bg-purple-600', dark: 'bg-gray-800', fairy: 'bg-pink-300',
  normal: 'bg-gray-400', fighting: 'bg-red-700', flying: 'bg-blue-300',
  poison: 'bg-purple-500', ground: 'bg-yellow-600', rock: 'bg-yellow-800',
  bug: 'bg-lime-500', ghost: 'bg-purple-700', steel: 'bg-gray-500',
};

const statShortNames: { [key: string]: string } = {
  hp: 'HP', attack: 'ATK', defense: 'DEF',
  'special-attack': 'SPA', 'special-defense': 'SPD', speed: 'SPE',
};

// Si existe una variable de entorno (en la nube), úsala. Si no, usa localhost.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

function App() {
  // --- ESTADOS ---
  const [pokemons, setPokemons] = useState<PokemonSummary[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokemonDetail | null>(null);
  const [language, setLanguage] = useState('es'); 
  const [isFavorite, setIsFavorite] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  // Auth
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  // UI Control
  const [offset, setOffset] = useState(0); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [isSearching, setIsSearching] = useState(false); 
  const [viewMode, setViewMode] = useState<'all' | 'favorites'>('all');
  const [isRetro, setIsRetro] = useState(false); 
  
  // Battle Mode
  const [isBattleMode, setIsBattleMode] = useState(false);
  const [contenders, setContenders] = useState<PokemonDetail[]>([]);

  // Team Management
  const [myTeam, setMyTeam] = useState<PokemonSummary[]>([]);
  const [analysis, setAnalysis] = useState<TeamAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Translation helper
  const t = translations[language as keyof typeof translations];

  // --- EFECTOS ---
  useEffect(() => {
    loadPokemons(0);
    const savedUser = localStorage.getItem('user');
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      if (isSearching) {
        setIsSearching(false);
        loadPokemons(0);
      }
      return;
    }
    const timeoutId = setTimeout(async () => {
      setIsSearching(true);
      try {
        const { data } = await axios.get(`${API_URL}/pokemon/search?term=${searchTerm.toLowerCase()}`);
        setPokemons(data);
      } catch (error) { console.error("Búsqueda sin resultados", error); setPokemons([]); }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // --- FUNCIONES LOGICAS ---

  // Auth
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const endpoint = authMode === 'login' ? '/auth/login' : '/auth/register';
        const payload = authMode === 'login' ? { email, password } : { email, password, name };
        const { data } = await axios.post(`${API_URL}${endpoint}`, payload);
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
        setShowAuthModal(false);
        setEmail(''); setPassword(''); setName('');
    } catch (error) { alert("Error en autenticación"); }
  };

  const logout = () => {
      setUser(null);
      localStorage.removeItem('user');
      setViewMode('all');
      setMyTeam([]);
      setAnalysis(null);
      loadPokemons(0);
  };

  // Carga Pokemons
  const loadPokemons = async (currentOffset: number) => {
    try {
      const { data } = await axios.get(`${API_URL}/pokemon?limit=20&offset=${currentOffset}`);
      if (currentOffset === 0) setPokemons(data);
      else setPokemons((prev) => [...prev, ...data]);
      setOffset(currentOffset + 20); 
    } catch (error) { console.error(error); }
  };

  // Favoritos
  const showFavorites = async () => {
    if (!user) { setAuthMode('login'); setShowAuthModal(true); return; }
    try {
      const { data } = await axios.get(`${API_URL}/pokemon/favorites`, {
          headers: { Authorization: `Bearer ${user.token}` }
      });
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

  // Detalles
  const fetchPokemonDetail = async (id: number) => {
      try {
        setRecommendations([]); 
        const { data } = await axios.get(`${API_URL}/pokemon/${id.toString()}`);
        setSelectedPokemon(data);
        setIsFavorite(false);
        axios.get(`${API_URL}/pokemon/${id}/recommendations`).then(res => setRecommendations(res.data));
      } catch (error) { console.error(error); }
  };

  // Like
  const toggleFavorite = async () => {
      if (!selectedPokemon) return;
      if (!user) { setAuthMode('login'); setShowAuthModal(true); return; }
      try {
        const { data } = await axios.post(`${API_URL}/pokemon/favorite/${selectedPokemon.id}`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
        });
        setIsFavorite(data.isFavorite); 
      } catch (error) { console.error("Error favoritos", error); }
  };

  const playCry = () => {
      if (selectedPokemon?.cry) {
        const audio = new Audio(selectedPokemon.cry);
        audio.volume = 0.5;
        audio.play();
      }
  };

  // Team Management
  const addToTeam = (poke: PokemonSummary) => {
    if (myTeam.find(p => p.id === poke.id)) return;
    if (myTeam.length >= 6) { alert(t.teamFull); return; }
    setMyTeam([...myTeam, poke]);
  };

  const removeFromTeam = (id: number) => {
    setMyTeam(myTeam.filter(p => p.id !== id));
  };

  const saveAndAnalyzeTeam = async () => {
    if (!user) { setAuthMode('login'); setShowAuthModal(true); return; }
    if (myTeam.length === 0) return;
    
    setIsAnalyzing(true);
    try {
      const { data: teamData } = await axios.post(
        `${API_URL}/teams`, 
        { name: `Equipo de ${user.name}`, pokemons: myTeam.map(p => p.id) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const { data: analysisData } = await axios.get(
        `${API_URL}/teams/${teamData.id}/analysis`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setAnalysis(analysisData);
    } catch (error) { console.error(error); alert("Error al analizar equipo"); } 
    finally { setIsAnalyzing(false); }
  };

  // Interacción
  const handlePokemonClick = async (id: number) => {
    if (!isBattleMode) { fetchPokemonDetail(id); return; }
    try {
      const { data } = await axios.get(`${API_URL}/pokemon/${id.toString()}`);
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
    <div className="min-h-screen bg-white pb-32">
      
      {/* HEADER POKÉMON STYLE */}
      <header className="bg-red-600 shadow-lg sticky top-0 z-40 border-b-4 border-red-800">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white rounded-full border-4 border-black flex items-center justify-center shadow-lg relative">
              <div className="w-5 h-5 bg-red-600 rounded-full border-2 border-black"></div>
              <div className="absolute -right-1 top-0 w-3 h-3 bg-yellow-400 rounded-full border border-black"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                {t.pokedex}
              </h1>
              <p className="text-xs text-red-200 font-bold">{t.digitalEncyclopedia}</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-center">
             {/* Language Selector */}
             <div className="flex bg-white rounded-full border-2 border-black overflow-hidden">
               {['es', 'en', 'de'].map(lang => (
                 <button 
                   key={lang} 
                   onClick={() => setLanguage(lang)} 
                   className={`px-3 py-1 text-xs font-bold uppercase ${
                     language === lang ? 'bg-blue-600 text-white' : 'bg-white text-black hover:bg-gray-100'
                   }`}
                 >
                   {lang}
                 </button>
               ))}
             </div>

             {user ? (
                <div className="flex items-center gap-2 bg-yellow-400 px-4 py-2 rounded-full border-2 border-black shadow-md">
                    <div className="w-6 h-6 bg-red-600 rounded-full border-2 border-black flex items-center justify-center">
                      <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                    </div>
                    <span className="text-sm font-bold text-black hidden sm:block">{user.name}</span>
                    <button onClick={logout} className="text-xs font-bold text-red-700 underline ml-2">{t.logout}</button>
                </div>
             ) : (
                <button 
                    onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}
                    className="px-4 py-2 rounded-full text-sm font-bold bg-yellow-400 text-black border-2 border-black shadow-md hover:bg-yellow-300"
                >
                    {t.login}
                </button>
             )}

            <button 
              onClick={() => setIsRetro(!isRetro)} 
              className={`px-4 py-2 rounded-full text-xs font-bold border-2 border-black shadow-md ${
                isRetro ? 'bg-purple-500 text-white' : 'bg-white text-black'
              }`}
            >
              {isRetro ? '8-BIT' : 'HD'}
            </button>
            
            <button 
              onClick={() => { setIsBattleMode(!isBattleMode); setContenders([]); }} 
              className={`px-4 py-2 rounded-full text-xs font-bold border-2 border-black shadow-md ${
                isBattleMode ? 'bg-orange-500 text-white' : 'bg-white text-black'
              }`}
            >
              {isBattleMode ? t.exitBattle : t.battle}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        
        {/* BARRA CONTROL POKÉMON */}
        <div className="bg-blue-600 rounded-xl p-4 mb-6 border-4 border-blue-800 shadow-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex gap-2">
              <button 
                onClick={showAll} 
                className={`px-6 py-2 rounded-lg font-bold border-2 border-black shadow-md ${
                  viewMode === 'all' ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                }`}
              >
                {t.all}
              </button>
              <button 
                onClick={showFavorites} 
                className={`px-6 py-2 rounded-lg font-bold border-2 border-black shadow-md ${
                  viewMode === 'favorites' ? 'bg-yellow-400 text-black' : 'bg-white text-black'
                }`}
              >
                {t.favorites}
              </button>
            </div>
            
            <div className="relative w-full md:w-96">
              <input 
                type="text" 
                placeholder={t.searchPlaceholder}
                className="w-full bg-white border-2 border-black rounded-lg px-4 py-2 text-black font-bold placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-yellow-400" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')} 
                  className="absolute right-2 top-2 text-black font-bold"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* FILTROS DE TIPO */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase">{t.filterByType}</h3>
          <div className="flex flex-wrap gap-2">
            {Object.keys(typeColors).map((type) => (
              <button 
                key={type} 
                onClick={() => filterByType(type)} 
                className={`${typeColors[type]} px-4 py-2 rounded-full text-xs font-black uppercase text-white border-2 border-black shadow-md hover:scale-105 transition-transform`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* GRID POKÉMON */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          {pokemons.map((poke) => {
            const selectionIndex = contenders.findIndex(c => c.id === poke.id);
            const isSelected = selectionIndex !== -1;
            const borderColor = selectionIndex === 0 ? 'border-blue-600' : selectionIndex === 1 ? 'border-red-600' : 'border-gray-300';

            return (
              <div 
                key={poke.id} 
                onClick={() => handlePokemonClick(poke.id)} 
                className={`bg-white rounded-xl p-4 border-4 ${borderColor} shadow-lg cursor-pointer hover:scale-105 transition-transform relative group`}
              >
                {isSelected && (
                  <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-black text-white border-2 border-black shadow-lg z-10 ${
                    selectionIndex === 0 ? 'bg-blue-600' : 'bg-red-600'
                  }`}>
                    {selectionIndex + 1}
                  </div>
                )}
                
                <div className="bg-gray-100 rounded-lg p-3 mb-2">
                  <img 
                    src={isRetro 
                      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png` 
                      : (poke.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${poke.id}.png`)
                    } 
                    alt={poke.name} 
                    className={`w-full h-24 object-contain ${isRetro ? 'rendering-pixelated' : ''}`} 
                    style={{ imageRendering: isRetro ? 'pixelated' : 'auto' }} 
                  />
                </div>
                
                <span className="text-gray-500 text-xs font-mono block text-center mb-1">
                  #{poke.id.toString().padStart(3, '0')}
                </span>
                <h3 className="text-sm font-black capitalize text-center text-black">
                  {poke.name}
                </h3>
                
                <button 
                  onClick={(e) => { e.stopPropagation(); addToTeam(poke); }} 
                  className="mt-2 w-full bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1 px-2 rounded-full border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {t.addToTeam}
                </button>
              </div>
            );
          })}
        </div>

        {/* CARGAR MÁS */}
        {!isSearching && viewMode === 'all' && (
          <div className="flex justify-center">
            <button 
              onClick={() => loadPokemons(offset)} 
              className="bg-yellow-400 hover:bg-yellow-300 text-black font-bold py-3 px-8 rounded-full border-4 border-black shadow-lg uppercase"
            >
              {t.loadMore}
            </button>
          </div>
        )}
      </main>

      {/* TEAM DOCK */}
      <div className="fixed bottom-0 left-0 w-full bg-red-600 border-t-4 border-red-800 p-4 z-30 shadow-2xl">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <h3 className="text-white font-black text-sm hidden md:block">{t.myTeam}</h3>
                <div className="flex gap-2">
                    {[0,1,2,3,4,5].map(index => {
                        const member = myTeam[index];
                        return (
                            <div 
                              key={index} 
                              className="w-14 h-14 rounded-lg bg-white border-2 border-black flex items-center justify-center relative group"
                            >
                                {member ? (
                                    <>
                                        <img src={member.image} className="w-full h-full object-contain p-1" alt={member.name} />
                                        <button 
                                          onClick={() => removeFromTeam(member.id)} 
                                          className="absolute -top-1 -right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 border border-black"
                                        >
                                          ✕
                                        </button>
                                    </>
                                ) : (
                                  <span className="text-gray-400 text-xs font-bold">{index + 1}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-yellow-300 text-sm font-bold hidden md:block">{myTeam.length}/6</span>
                <button 
                  onClick={saveAndAnalyzeTeam} 
                  disabled={myTeam.length === 0 || isAnalyzing} 
                  className={`bg-yellow-400 text-black font-black py-3 px-6 rounded-full border-4 border-black shadow-lg uppercase ${
                    (myTeam.length === 0 || isAnalyzing) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-yellow-300'
                  }`}
                >
                  {isAnalyzing ? t.analyzing : t.analyze}
                </button>
            </div>
         </div>
      </div>

      {/* MODAL ANÁLISIS */}
      {analysis && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={() => setAnalysis(null)}>
             <div className="bg-white rounded-xl max-w-6xl w-full border-8 border-yellow-400 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                
                <div className="bg-red-600 p-5 border-b-4 border-red-800 flex justify-between items-center">
                    <div>
                      <h2 className="text-2xl font-black text-white">{t.teamAnalysis}</h2>
                      <p className="text-yellow-300 text-sm font-bold">{t.poweredByAI}</p>
                    </div>
                    <button 
                      onClick={() => setAnalysis(null)} 
                      className="text-white font-bold text-2xl hover:text-yellow-400"
                    >
                      ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-blue-50">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* MVP */}
                    <div className="bg-white rounded-xl p-6 border-4 border-yellow-400 shadow-lg flex flex-col items-center">
                        <div className="bg-yellow-400 text-black font-black px-4 py-2 rounded-full text-xs mb-4 border-2 border-black">
                          {t.mvp}
                        </div>
                        <img src={analysis.mvp.image} className="w-40 h-40 object-contain mb-4" alt={analysis.mvp.name} />
                        <h3 className="text-2xl font-black text-black capitalize mb-2">{analysis.mvp.name}</h3>
                        <div className="bg-red-600 text-white px-4 py-2 rounded-lg border-2 border-black">
                          <p className="text-xs font-bold">{t.totalStats}</p>
                          <p className="text-2xl font-black">{analysis.mvp.totalStats}</p>
                        </div>
                    </div>
                    
                    {/* Radar */}
                    <div className="bg-white rounded-xl p-6 border-4 border-blue-600 shadow-lg">
                         <h3 className="text-center text-sm font-black text-black mb-4 uppercase">{t.teamBalance}</h3>
                         <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={[
                                    { subject: 'HP', A: analysis.averageStats.hp },
                                    { subject: 'ATK', A: analysis.averageStats.attack },
                                    { subject: 'DEF', A: analysis.averageStats.defense },
                                    { subject: 'SPE', A: analysis.averageStats.speed },
                                    { subject: 'SPD', A: analysis.averageStats.spDefense },
                                    { subject: 'SPA', A: analysis.averageStats.spAttack },
                                ]}>
                                  <PolarGrid stroke="#ddd" />
                                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontWeight: 'bold' }} />
                                  <PolarRadiusAxis domain={[0, 150]} tick={false} />
                                  <Radar dataKey="A" stroke="#dc2626" strokeWidth={3} fill="#dc2626" fillOpacity={0.3} />
                                </RadarChart>
                            </ResponsiveContainer>
                         </div>
                    </div>
                    
                    {/* Warnings */}
                    <div className="bg-white rounded-xl p-6 border-4 border-green-500 shadow-lg">
                        <h3 className="text-sm font-black text-black mb-4 uppercase">{t.diagnosis}</h3>
                        <div className="space-y-2 mb-4">
                            {analysis.warnings.map((warn, i) => {
                              const isGood = warn.includes('✅');
                              return (
                                <div 
                                  key={i} 
                                  className={`p-3 rounded-lg border-2 border-black text-xs font-bold ${
                                    isGood ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                  }`}
                                >
                                  {warn}
                                </div>
                              );
                            })}
                        </div>
                        
                        <div className="bg-gray-100 p-4 rounded-lg border-2 border-black">
                            <h4 className="text-xs font-black text-black mb-2 uppercase">{t.typeComposition}</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(analysis.typeDistribution).map(([type, count]) => (
                                    <div key={type} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-black">
                                        <div className={`w-3 h-3 rounded-full ${typeColors[type]}`}></div>
                                        <span className="text-xs font-bold capitalize">{type}: {count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
             </div>
        </div>
      )}

      {/* MODAL AUTH */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={() => setShowAuthModal(false)}>
            <div className="bg-white rounded-xl p-8 w-full max-w-md border-8 border-yellow-400 shadow-2xl" onClick={e => e.stopPropagation()}>
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-4 border-4 border-black flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-full"></div>
                  </div>
                  <h2 className="text-2xl font-black text-black mb-1">
                    {authMode === 'login' ? t.signIn : t.createAccount}
                  </h2>
                  <p className="text-sm text-gray-600 font-bold">
                    {authMode === 'login' ? t.enterData : t.registerTrainer}
                  </p>
                </div>
                
                <form onSubmit={handleAuth} className="space-y-4">
                    {authMode === 'register' && (
                      <input 
                        type="text" 
                        placeholder={t.trainerName}
                        required 
                        className="w-full bg-gray-100 border-2 border-black rounded-lg p-3 font-bold" 
                        value={name} 
                        onChange={e => setName(e.target.value)} 
                      />
                    )}
                    <input 
                      type="email" 
                      placeholder={t.email}
                      required 
                      className="w-full bg-gray-100 border-2 border-black rounded-lg p-3 font-bold" 
                      value={email} 
                      onChange={e => setEmail(e.target.value)} 
                    />
                    <input 
                      type="password" 
                      placeholder={t.password}
                      required 
                      className="w-full bg-gray-100 border-2 border-black rounded-lg p-3 font-bold" 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                    />
                    <button 
                      type="submit" 
                      className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-full border-4 border-black shadow-lg uppercase"
                    >
                      {authMode === 'login' ? t.enter : t.register}
                    </button>
                </form>
                
                <button 
                  onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} 
                  className="mt-4 w-full text-center text-gray-600 font-bold text-sm underline"
                >
                  {authMode === 'login' ? t.noAccount : t.hasAccount}
                </button>
            </div>
        </div>
      )}

      {/* MODAL DETALLE */}
      {selectedPokemon && (
        <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4" onClick={() => setSelectedPokemon(null)}>
          <div className="bg-white rounded-xl max-w-4xl w-full border-8 border-red-600 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-red-600 p-4 border-b-4 border-red-800 flex justify-between items-center">
              <h2 className="text-2xl font-black text-white capitalize">{selectedPokemon.name}</h2>
              <button onClick={() => setSelectedPokemon(null)} className="text-white font-bold text-2xl">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Imagen */}
                <div className="bg-gray-100 rounded-xl p-8 border-4 border-gray-300 flex flex-col items-center">
                  <img 
                    src={isRetro 
                      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${selectedPokemon.id}.png` 
                      : (selectedPokemon.image || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${selectedPokemon.id}.png`)
                    } 
                    className={`object-contain mb-4 ${isRetro ? 'w-48 h-48 rendering-pixelated' : 'w-64 h-64'}`} 
                    style={{ imageRendering: isRetro ? 'pixelated' : 'auto' }} 
                    alt={selectedPokemon.name}
                  />
                  <div className="flex gap-2 mb-4">
                    {selectedPokemon.types.map(t => (
                      <span key={t} className={`${typeColors[t]} px-4 py-2 rounded-full text-xs font-black uppercase text-white border-2 border-black`}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={playCry} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold border-2 border-black">
                      {t.sound}
                    </button>
                    <button onClick={toggleFavorite} className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${isFavorite ? 'bg-red-500 text-white' : 'bg-white text-black'}`}>
                      {isFavorite ? t.favorite : t.save}
                    </button>
                  </div>
                </div>
                
                {/* Info */}
                <div>
                  <div className="bg-yellow-400 p-3 rounded-lg border-2 border-black mb-4">
                    <span className="font-mono text-sm font-bold">ID: #{selectedPokemon.id.toString().padStart(3, '0')}</span>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex gap-1 mb-2">
                      {['es', 'en', 'de'].map(lang => (
                        <button 
                          key={lang} 
                          onClick={() => setLanguage(lang)} 
                          className={`px-3 py-1 text-xs font-bold uppercase rounded border-2 border-black ${language === lang ? 'bg-blue-600 text-white' : 'bg-white text-black'}`}
                        >
                          {lang}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 bg-gray-100 p-4 rounded-lg border-2 border-black font-bold italic">
                      "{selectedPokemon.descriptions?.[language] || t.noDescription}"
                    </p>
                  </div>
                  
                  {selectedPokemon.evolutions?.length > 0 && (
                    <div className="mb-4">
                      <h3 className="text-xs font-black text-black mb-2 uppercase">{t.evolutionChain}</h3>
                      <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg border-2 border-black">
                        {selectedPokemon.evolutions.map((evo, i) => (
                          <div key={evo.id} className="flex items-center gap-2">
                            {i > 0 && <span className="text-black font-bold">→</span>}
                            <div 
                              onClick={() => fetchPokemonDetail(evo.id)} 
                              className="cursor-pointer text-center hover:scale-110 transition-transform"
                            >
                              <img src={evo.image} alt={evo.name} className="w-12 h-12 object-contain" />
                              <span className="text-[10px] font-bold capitalize block">{evo.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="h-48">
                    <h3 className="text-xs font-black text-black mb-2 uppercase">{t.baseStats}</h3>
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={selectedPokemon.stats}>
                        <PolarGrid stroke="#ddd" />
                        <PolarAngleAxis dataKey="name" tickFormatter={(v) => statShortNames[v] || v} tick={{ fill: '#000', fontWeight: 'bold', fontSize: 10 }} />
                        <PolarRadiusAxis domain={[0, 150]} tick={false} />
                        <Radar dataKey="value" stroke="#dc2626" strokeWidth={2} fill="#dc2626" fillOpacity={0.3} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="mt-4">
                    <h3 className="text-xs font-black text-black mb-2 uppercase">{t.similarPokemon}</h3>
                    {recommendations.length === 0 ? (
                      <p className="text-xs text-gray-500 italic">{t.calculating}</p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2">
                        {recommendations.map(rec => (
                          <div 
                            key={rec.id} 
                            onClick={() => fetchPokemonDetail(rec.id)} 
                            className="bg-gray-100 p-2 rounded border-2 border-black cursor-pointer hover:bg-gray-200 text-center"
                          >
                            <img src={rec.image} className="w-10 h-10 object-contain mx-auto mb-1" alt={rec.name} />
                            <p className="text-[10px] font-bold capitalize">{rec.name}</p>
                            <p className="text-[9px] text-gray-600">{t.distance}: {Math.round(rec.distance)}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL BATALLA */}
      {contenders.length === 2 && (
        <div className="fixed inset-0 bg-black/90 flex justify-center items-center z-50 p-4" onClick={exitBattleMode}>
          <div className="bg-white rounded-xl max-w-5xl w-full border-8 border-orange-500 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            <div className="bg-orange-500 p-4 border-b-4 border-orange-700 text-center">
              <h2 className="text-2xl font-black text-white">{t.pokemonBattle}</h2>
              <button onClick={exitBattleMode} className="absolute top-4 right-4 text-white font-bold text-2xl">✕</button>
            </div>
            
            <div className="grid grid-cols-3 p-6 gap-4 bg-blue-50">
              
              {/* Player 1 */}
              <div className="bg-white rounded-xl p-6 border-4 border-blue-600 text-center">
                <div className="bg-blue-600 text-white font-black px-3 py-1 rounded-full text-xs mb-4 inline-block border-2 border-black">
                  {t.player} 1
                </div>
                <h3 className="text-xl font-black capitalize mb-4">{contenders[0].name}</h3>
                <img src={contenders[0].image} className="w-32 h-32 object-contain mx-auto mb-4" alt={contenders[0].name} />
                <div className="bg-blue-100 p-3 rounded-lg border-2 border-black">
                  <p className="text-xs font-bold text-blue-800">{t.total}</p>
                  <p className="text-3xl font-black text-blue-600">
                    {contenders[0].stats.reduce((a, s) => a + s.value, 0)}
                  </p>
                </div>
              </div>
              
              {/* Radar Comparison */}
              <div className="bg-white rounded-xl p-6 border-4 border-yellow-400">
                <h3 className="text-center text-xs font-black mb-4 uppercase">{t.comparison}</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={contenders[0].stats.map((s, i) => ({
                      subject: statShortNames[s.name] || s.name,
                      A: s.value,
                      B: contenders[1].stats[i].value,
                    }))}>
                      <PolarGrid stroke="#ddd" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: '#000', fontWeight: 'bold' }} />
                      <PolarRadiusAxis domain={[0, 150]} tick={false} />
                      <Radar dataKey="A" stroke="#2563eb" strokeWidth={3} fill="#2563eb" fillOpacity={0.2} />
                      <Radar dataKey="B" stroke="#dc2626" strokeWidth={3} fill="#dc2626" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Player 2 */}
              <div className="bg-white rounded-xl p-6 border-4 border-red-600 text-center">
                <div className="bg-red-600 text-white font-black px-3 py-1 rounded-full text-xs mb-4 inline-block border-2 border-black">
                  {t.player} 2
                </div>
                <h3 className="text-xl font-black capitalize mb-4">{contenders[1].name}</h3>
                <img src={contenders[1].image} className="w-32 h-32 object-contain mx-auto mb-4" alt={contenders[1].name} />
                <div className="bg-red-100 p-3 rounded-lg border-2 border-black">
                  <p className="text-xs font-bold text-red-800">{t.total}</p>
                  <p className="text-3xl font-black text-red-600">
                    {contenders[1].stats.reduce((a, s) => a + s.value, 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;