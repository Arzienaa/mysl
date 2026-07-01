import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, RefreshCw, Send, Check } from 'lucide-react';

type GameId = 'cake' | 'flowers' | 'bears' | 'bunny' | 'swan' | 'strawberries' | 'letter';

interface Topping {
  id: number;
  emoji: string;
  x: number;
  y: number;
}

interface FlowerStem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotation: number;
}

const BOUQUET_SLOTS = [
  // Row 1 (Lowest, closest to vase mouth, dense base)
  { x: 50, y: 35, rotation: 0 },
  { x: 41, y: 33, rotation: -12 },
  { x: 59, y: 33, rotation: 12 },
  { x: 32, y: 31, rotation: -22 },
  { x: 68, y: 31, rotation: 22 },

  // Row 2 (Middle crown, forming the body of the dome)
  { x: 50, y: 24, rotation: 0 },
  { x: 41, y: 22, rotation: -12 },
  { x: 59, y: 22, rotation: 12 },
  { x: 32, y: 20, rotation: -25 },
  { x: 68, y: 20, rotation: 25 },

  // Row 3 (Upper crown, high blossoms)
  { x: 50, y: 12, rotation: 0 },
  { x: 41, y: 10, rotation: -15 },
  { x: 59, y: 10, rotation: 15 },
  { x: 30, y: 11, rotation: -30 },
  { x: 70, y: 11, rotation: 30 },

  // Row 4 (Outer filler details and extra leaves)
  { x: 23, y: 23, rotation: -40 },
  { x: 77, y: 23, rotation: 40 },
  { x: 46, y: 16, rotation: -5 },
  { x: 54, y: 16, rotation: 5 },
  { x: 36, y: 27, rotation: -15 },
  { x: 64, y: 27, rotation: 15 }
];

export default function MiniGamesRoom() {
  const [activeGame, setActiveGame] = useState<GameId>('cake');

  // Game 1: Decorate Cake States
  const [cakeToppings, setCakeToppings] = useState<Topping[]>([]);
  const [cakeFlavor, setCakeFlavor] = useState<'pink' | 'vanilla'>('pink');

  // Game 2: Arrange Flowers States
  const [bouquetStems, setBouquetStems] = useState<FlowerStem[]>([]);

  // Game 3: Find Hidden Bears
  const [foundBears, setFoundBears] = useState<string[]>([]); // 'closet', 'blanket', 'desk'

  // Game 4: Feed the Bunny
  const [bunnyBites, setBunnyBites] = useState(0);
  const [isBunnyChewing, setIsBunnyChewing] = useState(false);
  const [flyingTreat, setFlyingTreat] = useState<string | null>(null);

  // Game 5: Help Swan to Lake
  const [swanPosition, setSwanPosition] = useState(10); // percentage along the path

  // Game 6: Catch Strawberries
  const [teacupX, setTeacupX] = useState(50); // percentage
  const [strawberryScore, setStrawberryScore] = useState(0);
  const [activeBerries, setActiveBerries] = useState<{ id: number; x: number; y: number; speed: number }[]>([
    { id: 1, x: 25, y: -10, speed: 2.2 },
    { id: 2, x: 55, y: -45, speed: 3.0 },
    { id: 3, x: 75, y: -75, speed: 2.5 },
  ]);

  // Game 7: Write yourself a letter
  const [letterText, setLetterText] = useState('');
  const [isLetterSent, setIsLetterSent] = useState(false);

  // --- Handlers for Game 1: Decorate Cake ---
  const handleAddCakeTopping = (emoji: string) => {
    const nextTopping: Topping = {
      id: Date.now() + Math.random(),
      emoji,
      x: Math.random() * 60 + 20, // Keep centered over the cake
      y: Math.random() * 25 + 25, // Upper half of cake
    };
    setCakeToppings((prev) => [...prev, nextTopping]);
  };

  // --- Handlers for Game 2: Arrange Flowers ---
  const handleAddFlowerStem = (emoji: string) => {
    const slotIdx = bouquetStems.length;
    const slot = BOUQUET_SLOTS[slotIdx % BOUQUET_SLOTS.length];
    
    // Add a tiny touch of organic randomized variation so they feel alive but perfectly symmetrical and neat
    const stem: FlowerStem = {
      id: Date.now() + Math.random(),
      emoji,
      x: slot.x + (Math.random() - 0.5) * 1.2,
      y: slot.y + (Math.random() - 0.5) * 1.2,
      rotation: slot.rotation + (Math.random() - 0.5) * 3,
    };
    setBouquetStems((prev) => [...prev, stem]);
  };

  // --- Handlers for Game 4: Feed Bunny ---
  const handleFeedBunny = (treat: 'carrot' | 'berry') => {
    setFlyingTreat(treat === 'carrot' ? '🥕' : '🍓');
    setIsBunnyChewing(true);
    setBunnyBites((b) => b + 1);
    setTimeout(() => {
      setIsBunnyChewing(false);
      setFlyingTreat(null);
    }, 800);
  };

  // --- Handlers for Game 6: Catch Strawberries ---
  const handleCatchBerry = (id: number) => {
    setStrawberryScore((s) => s + 1);
    setActiveBerries((prev) =>
      prev.map((b) =>
        b.id === id
          ? { id: b.id, x: Math.random() * 80 + 10, y: -10, speed: Math.random() * 1.5 + 2 }
          : b
      )
    );
  };

  const moveTeacup = (direction: 'left' | 'right') => {
    setTeacupX((prev) => {
      if (direction === 'left') return Math.max(5, prev - 10);
      return Math.min(95, prev + 10);
    });
  };

  // Game loop for falling strawberries
  React.useEffect(() => {
    if (activeGame !== 'strawberries') return;

    let active = true;
    const interval = setInterval(() => {
      if (!active) return;
      setActiveBerries((prev) =>
        prev.map((b) => {
          let newY = b.y + b.speed;
          
          // Collision check with teacup (at bottom, let's say y >= 80% and y <= 90%)
          // Teacup is at left: teacupX% (width of teacup is ~12%)
          const teacupLeft = teacupX - 8;
          const teacupRight = teacupX + 8;
          
          if (newY >= 80 && newY <= 90 && b.x >= teacupLeft && b.x <= teacupRight) {
            // Caught in teacup!
            setStrawberryScore((s) => s + 1);
            return {
              id: b.id,
              x: Math.random() * 80 + 10,
              y: -10,
              speed: Math.random() * 1.5 + 2,
            };
          }
          
          // If it falls off screen (y > 100)
          if (newY > 100) {
            return {
              id: b.id,
              x: Math.random() * 80 + 10,
              y: -10,
              speed: Math.random() * 1.5 + 2,
            };
          }
          
          return { ...b, y: newY };
        })
      );
    }, 45); // Smooth falling frame rate

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [activeGame, teacupX]);

  // Arrow key controls for teacup
  React.useEffect(() => {
    if (activeGame !== 'strawberries') return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        setTeacupX((prev) => Math.max(5, prev - 8));
      } else if (e.key === 'ArrowRight') {
        setTeacupX((prev) => Math.min(95, prev + 8));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeGame]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8 bg-[#FAF6F0] rounded-3xl p-6 md:p-8 border border-pink-100 relative shadow-sm">
      
      {/* Header */}
      <div className="text-center max-w-md mx-auto mb-8">
        <h1 className="font-serif text-3xl text-[#5E3A3A] tracking-wider">
          Cozy Cottage Playground
        </h1>
        <p className="font-garamond italic text-base text-[#8A7171] mt-1">
          "Relaxing micro-activities. No scores, no pressure, just simple warmth."
        </p>
      </div>

      {/* Selector ribbon buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {[
          { id: 'cake', label: '🎂 Decorate Cake' },
          { id: 'flowers', label: '💐 Arrange Bouquet' },
          { id: 'bears', label: '🧸 Hidden Bears' },
          { id: 'bunny', label: '🐰 Feed Bunny' },
          { id: 'swan', label: '🦢 Guide Swan' },
          { id: 'strawberries', label: '🍓 Catch Berries' },
          { id: 'letter', label: '✉️ Letter to Self' },
        ].map((game) => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id as GameId)}
            className={`px-4 py-2 rounded-full font-serif text-[11px] tracking-wider border cursor-pointer transition-all interactive-obj ${
              activeGame === game.id
                ? 'bg-[#ffb3b8] text-white border-[#ffb3b8] shadow-sm'
                : 'bg-white text-[#5E3A3A] border-[#ffd6d9] hover:bg-[#FFEBEB]'
            }`}
          >
            {game.label}
          </button>
        ))}
      </div>

      {/* Main Game Interface Frame */}
      <div className="bg-white rounded-3xl border border-[#ffb3b8]/30 min-h-[420px] shadow-sm p-6 relative overflow-hidden flex flex-col justify-between">
        
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-pink-100 via-pink-200 to-amber-100 pointer-events-none" />

        <AnimatePresence mode="wait">
          
          {/* 1. DECORATE A CAKE */}
          {activeGame === 'cake' && (
            <motion.div
              key="cake"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7 bg-[#FFF8F9] rounded-2xl border border-pink-100 aspect-[16/10] w-full relative flex items-center justify-center p-4 overflow-hidden shadow-inner">
                {/* Cake drawing frame */}
                <div className="relative w-48 h-32 bg-stone-100 rounded-b-3xl border-2 border-stone-200 shadow-md flex flex-col justify-end overflow-visible mt-12">
                  
                  {/* Cream icing layers */}
                  <div className={`absolute inset-x-0 bottom-0 h-4/5 rounded-b-2xl border-t-8 border-white ${
                    cakeFlavor === 'pink' ? 'bg-[#FFD6D9]' : 'bg-[#FAF6EE]'
                  }`} />
                  
                  {/* Candle flame */}
                  <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], y: [0, -2, 0] }}
                      transition={{ repeat: Infinity, duration: 1 }}
                      className="w-3 h-5 bg-amber-400 rounded-full blur-[1px]"
                    />
                    <div className="w-1.5 h-6 bg-[#ffb3b8] rounded-t-sm" />
                  </div>

                  {/* Absolute decorations toppings layer */}
                  {cakeToppings.map((top) => (
                    <div
                      key={top.id}
                      className="absolute text-xl pointer-events-none select-none"
                      style={{ left: `${top.x}%`, top: `${top.y}%` }}
                    >
                      {top.emoji}
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-3 left-4 font-garamond italic text-[10px] text-[#8A7171]">
                  "Press buttons on side to drop toppings"
                </div>
              </div>

              {/* Side controls */}
              <div className="md:col-span-5 flex flex-col gap-4 w-full">
                <div className="pb-2 border-b border-pink-100">
                  <h3 className="font-serif text-base font-bold text-[#5E3A3A]">Coquette Patisserie</h3>
                  <p className="text-[10px] text-[#8A7171] mt-0.5">Customize your cozy tier cake.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A7171]">Flavor Base:</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCakeFlavor('pink')}
                      className={`px-3 py-1 rounded-full text-[10px] font-serif cursor-pointer border interactive-obj ${
                        cakeFlavor === 'pink' ? 'bg-[#ffb3b8] text-white border-white' : 'bg-white text-[#5E3A3A] border-[#ffd6d9]'
                      }`}
                    >
                      🍓 Strawberry Cream
                    </button>
                    <button
                      onClick={() => setCakeFlavor('vanilla')}
                      className={`px-3 py-1 rounded-full text-[10px] font-serif cursor-pointer border interactive-obj ${
                        cakeFlavor === 'vanilla' ? 'bg-[#ffb3b8] text-white border-white' : 'bg-white text-[#5E3A3A] border-[#ffd6d9]'
                      }`}
                    >
                      🎂 Vanilla Honey
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A7171]">Sprinkle Toppings:</span>
                  <div className="flex flex-wrap gap-2">
                    {['🍓', '🍒', '🍪', '🎀', '⭐', '✨', '🕯️', '🌸'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => handleAddCakeTopping(emoji)}
                        className="w-8 h-8 rounded-full bg-pink-50 hover:bg-[#FFEBEB] text-sm border border-pink-100 cursor-pointer flex items-center justify-center transition-all interactive-obj"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setCakeToppings([])}
                  className="w-full py-1.5 bg-[#FFF5F6] hover:bg-[#FFEBEB] text-xs text-[#ff808b] border border-pink-100 rounded-full cursor-pointer transition-all interactive-obj"
                >
                  Reset Decoration ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* 2. ARRANGE FLOWERS */}
          {activeGame === 'flowers' && (
            <motion.div
              key="flowers"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7 bg-[#FAFDFC] rounded-2xl border border-[#CCD9CC] aspect-[16/10] w-full relative flex items-center justify-center p-4 overflow-hidden shadow-inner">
                
                {/* Visual ceramic vase on table */}
                <div className="relative w-36 h-40 flex flex-col items-center justify-end overflow-visible">
                  
                  {/* SVG Green Stem Lines tucked behind the flower heads but ending inside the vase */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                    {bouquetStems.map((stem) => (
                      <motion.line
                        key={`stem-${stem.id}`}
                        x1="50%"
                        y1="45%"
                        x2={`${stem.x}%`}
                        y2={`${stem.y}%`}
                        stroke="#3D6646" // Cozy earthy botanical green
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                      />
                    ))}
                  </svg>

                  {/* Arranged stems absolute overlay */}
                  {bouquetStems.map((stem) => (
                    <motion.div
                      key={stem.id}
                      initial={{ scale: 0, y: -15, rotate: stem.rotation - 10 }}
                      animate={{ scale: 1.15, y: 0, rotate: stem.rotation }}
                      className="absolute text-4xl pointer-events-none select-none z-20"
                      style={{ 
                        left: `${stem.x}%`, 
                        top: `${stem.y}%`,
                        transform: `translate(-50%, -50%)`
                      }}
                    >
                      {stem.emoji}
                    </motion.div>
                  ))}

                  {/* Ceramic Vase Bowl */}
                  <div className="w-20 h-24 bg-white border-2 border-stone-200 rounded-b-3xl rounded-t-xl shadow-md z-10 relative flex items-center justify-center">
                    <span className="text-xl opacity-60">🏺</span>
                    <div className="absolute inset-x-2 top-2 h-0.5 bg-sky-200/40 rounded" />
                  </div>
                </div>

                <div className="absolute bottom-3 left-4 font-garamond italic text-[10px] text-[#6E8A73]">
                  "Whimsical glass flower arranging jar"
                </div>
              </div>

              {/* Controls */}
              <div className="md:col-span-5 flex flex-col gap-4 w-full">
                <div className="pb-2 border-b border-stone-100">
                  <h3 className="font-serif text-base font-bold text-[#3A4E3D]">Cottage Florist</h3>
                  <p className="text-[10px] text-[#6E8A73] mt-0.5">Assemble flowers in a vase.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A7171]">Flower Stems:</span>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { emoji: '🌹', name: 'Rose' },
                      { emoji: '🪷', name: 'Lily' },
                      { emoji: '🌼', name: 'Daisy' },
                      { emoji: '🪻', name: 'Lavender' },
                      { emoji: '🌿', name: 'Ivy Leaf' },
                      { emoji: '🌾', name: 'Wheat' },
                    ].map((f) => (
                      <button
                        key={f.name}
                        onClick={() => handleAddFlowerStem(f.emoji)}
                        className="px-3 py-1.5 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 text-xs text-[#3A4E3D] cursor-pointer transition-all flex items-center gap-1 interactive-obj"
                      >
                        <span>{f.emoji}</span>
                        <span>{f.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setBouquetStems([])}
                  className="w-full py-1.5 bg-stone-50 hover:bg-stone-100 text-xs text-[#8A7171] border border-stone-200 rounded-full cursor-pointer transition-all interactive-obj"
                >
                  Clear Vase Bouquet ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* 3. FIND HIDDEN BEARS */}
          {activeGame === 'bears' && (
            <motion.div
              key="bears"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7 bg-[#FFFBF7] rounded-2xl border border-pink-100 aspect-[16/10] w-full relative overflow-hidden shadow-inner p-4">
                
                {/* Sketch layout representation */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FFEBEB]/20 to-[#E5ECE5]/10" />

                {/* Simulated bedroom drawing backdrop details */}
                <div className="absolute top-[30%] left-[10%] w-20 h-10 border border-stone-300 rounded text-[9px] text-stone-400 p-1">Bed frame</div>
                <div className="absolute top-[20%] right-[15%] w-14 h-16 border border-stone-300 rounded text-[9px] text-stone-400 p-1">Bookshelf</div>
                <div className="absolute bottom-[10%] left-[40%] w-16 h-12 border border-stone-300 rounded text-[9px] text-stone-400 p-1">Desk</div>

                {/* Hidden Bear 1: closet bookshelf */}
                <motion.button
                  onClick={() => {
                    if (!foundBears.includes('bookshelf')) setFoundBears((prev) => [...prev, 'bookshelf']);
                  }}
                  className={`absolute top-[28%] right-[18%] text-xl transition-all cursor-pointer ${
                    foundBears.includes('bookshelf') ? 'opacity-100 scale-125' : 'opacity-[0.08] hover:opacity-30 scale-90'
                  } interactive-obj`}
                  title="Under bookshelf stack"
                >
                  🧸
                </motion.button>

                {/* Hidden Bear 2: bed covers */}
                <motion.button
                  onClick={() => {
                    if (!foundBears.includes('closet')) setFoundBears((prev) => [...prev, 'closet']);
                  }}
                  className={`absolute top-[32%] left-[18%] text-xl transition-all cursor-pointer ${
                    foundBears.includes('closet') ? 'opacity-100 scale-125' : 'opacity-[0.08] hover:opacity-30 scale-90'
                  } interactive-obj`}
                  title="Beside bedroom closet doors"
                >
                  🧸
                </motion.button>

                {/* Hidden Bear 3: desk papers */}
                <motion.button
                  onClick={() => {
                    if (!foundBears.includes('desk')) setFoundBears((prev) => [...prev, 'desk']);
                  }}
                  className={`absolute bottom-[14%] left-[45%] text-xl transition-all cursor-pointer ${
                    foundBears.includes('desk') ? 'opacity-100 scale-125' : 'opacity-[0.08] hover:opacity-30 scale-90'
                  } interactive-obj`}
                  title="Under writing papers"
                >
                  🧸
                </motion.button>

                <div className="absolute bottom-3 left-4 font-garamond italic text-[10px] text-[#8A7171]">
                  "Hover/click around closet bed frame, desk, and bookshelf stack to find them!"
                </div>
              </div>

              {/* Side controls */}
              <div className="md:col-span-5 flex flex-col gap-4 w-full">
                <div className="pb-2 border-b border-stone-100">
                  <h3 className="font-serif text-base font-bold text-[#5E3A3A]">Hidden Teddy Bears</h3>
                  <p className="text-[10px] text-[#8A7171] mt-0.5">Three sweet bears are hiding in the bedroom sketch.</p>
                </div>

                <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100/40 flex flex-col gap-2">
                  <span className="text-[11px] font-serif uppercase tracking-wider text-[#8A7171]">Bears Found: {foundBears.length} / 3</span>
                  <div className="flex gap-2 justify-center">
                    {['Bookshelf stack 🧸', 'Closet bed 🧸', 'Desk papers 🧸'].map((b, i) => {
                      const tags = ['bookshelf', 'closet', 'desk'];
                      const isFound = foundBears.includes(tags[i]);
                      return (
                        <div key={i} className={`px-2 py-1 rounded text-[9px] font-sans border flex items-center gap-1 ${
                          isFound ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold' : 'bg-stone-50 border-stone-200 text-stone-400'
                        }`}>
                          {isFound ? '✓ Found' : '🔒 Hidden'}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {foundBears.length >= 3 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-pink-50 text-pink-700 text-center rounded-xl text-xs font-serif"
                  >
                    💖 You found all 3 teddy bears! Ribbon and Clover thank you! 💖
                  </motion.div>
                )}

                <button
                  onClick={() => setFoundBears([])}
                  className="w-full py-1.5 bg-[#FFF5F6] hover:bg-[#FFEBEB] text-xs text-[#ff808b] border border-pink-100 rounded-full cursor-pointer transition-all interactive-obj"
                >
                  Reset Game ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* 4. FEED THE BUNNY */}
          {activeGame === 'bunny' && (
            <motion.div
              key="bunny"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7 bg-[#FFFBF7] rounded-2xl border border-[#CCD9CC] aspect-[16/10] w-full relative flex flex-col justify-center items-center overflow-hidden shadow-inner p-4">
                
                {/* Bunny graphic */}
                <div className="relative flex flex-col items-center">
                  {flyingTreat && (
                    <motion.div
                      initial={{ y: 60, scale: 0.5, opacity: 1 }}
                      animate={{ y: -10, scale: 1.3, opacity: 0 }}
                      transition={{ duration: 0.7, ease: "easeOut" }}
                      className="absolute text-4xl z-20 pointer-events-none"
                    >
                      {flyingTreat}
                    </motion.div>
                  )}
                  {isBunnyChewing ? (
                    <motion.div
                      animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
                      transition={{ duration: 0.4, repeat: 2 }}
                      className="text-7xl select-none"
                    >
                      🐰🐹
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                      className="text-7xl select-none"
                    >
                      🐰
                    </motion.div>
                  )}

                  {/* Munching bubbles */}
                  {isBunnyChewing && (
                    <span className="absolute top-[-15px] right-[-30px] text-xs font-serif bg-pink-100 px-2 py-0.5 rounded-full text-pink-700 shadow animate-pulse">
                      nom nom... 💖
                    </span>
                  )}
                </div>

                <p className="font-garamond italic text-xs text-[#8A7171] mt-4">
                  "Hop hop! Clover the bunny is waiting for a sweet snack."
                </p>
              </div>

              {/* Side controls */}
              <div className="md:col-span-5 flex flex-col gap-4 w-full">
                <div className="pb-2 border-b border-stone-100">
                  <h3 className="font-serif text-base font-bold text-[#5E3A3A]">Bunny Snack Time</h3>
                  <p className="text-[10px] text-[#8A7171] mt-0.5">Feed Clover treats to make them chew with delight.</p>
                </div>

                <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100/40 flex flex-col gap-2 items-center text-center">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A7171]">Feeding Count: {bunnyBites} bites</span>
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={() => handleFeedBunny('carrot')}
                      className="px-4 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-full text-xs font-serif cursor-pointer flex items-center gap-1 interactive-obj"
                    >
                      🥕 Crunchy Carrot
                    </button>
                    <button
                      onClick={() => handleFeedBunny('berry')}
                      className="px-4 py-2 bg-pink-50 hover:bg-[#FFEBEB] border border-pink-200 rounded-full text-xs font-serif cursor-pointer flex items-center gap-1 interactive-obj"
                    >
                      🍓 Strawberry Bit
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => setBunnyBites(0)}
                  className="w-full py-1.5 bg-[#FFF5F6] hover:bg-[#FFEBEB] text-xs text-[#ff808b] border border-pink-100 rounded-full cursor-pointer transition-all interactive-obj"
                >
                  Reset Bites ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* 5. HELP SWAN TO LAKE */}
          {activeGame === 'swan' && (
            <motion.div
              key="swan"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7 bg-[#FAFDFC] rounded-2xl border border-sky-100 aspect-[16/10] w-full relative flex flex-col justify-between overflow-hidden shadow-inner p-6">
                
                {/* Path line background */}
                <div className="absolute inset-x-12 top-[48%] h-2 bg-emerald-100 rounded-full" />
                
                {/* Lake graphic on right side */}
                <div className="absolute right-4 top-[35%] w-20 h-20 bg-sky-100 border-2 border-sky-300/40 rounded-full flex items-center justify-center">
                  <span className="text-xl animate-pulse">🌊🌱</span>
                </div>

                {/* Sliding Swan */}
                <div 
                  className="relative w-full h-32 mt-6 cursor-pointer"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const percent = Math.min(80, Math.max(10, ((e.clientX - rect.left) / rect.width) * 100));
                    setSwanPosition(Math.round(percent));
                  }}
                  title="Click anywhere along the path to swim the swan!"
                >
                  <motion.div
                    className="absolute text-4xl select-none cursor-grab active:cursor-grabbing hover:scale-110 transition-transform"
                    style={{ left: `${swanPosition}%`, top: '25%', transform: 'translateX(-50%)' }}
                    animate={swanPosition >= 75 ? { y: [0, -4, 0] } : {}}
                    transition={{ repeat: Infinity, duration: 1.2 }}
                  >
                    🦢
                  </motion.div>
                </div>

                <div className="flex justify-between items-center z-10">
                  <span className="font-garamond italic text-[10px] text-emerald-700/80">Cottage garden path</span>
                  <span className="font-garamond italic text-[10px] text-sky-700/80">Tranquil blue lake</span>
                </div>
              </div>

              {/* Side controls */}
              <div className="md:col-span-5 flex flex-col gap-4 w-full">
                <div className="pb-2 border-b border-stone-100">
                  <h3 className="font-serif text-base font-bold text-[#3A4E3D]">Guide Swan to Water</h3>
                  <p className="text-[10px] text-[#6E8A73] mt-0.5">Drag/slide the swan along the garden path to the blue lake.</p>
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A7171]">Swan Path progress:</span>
                  <input
                    type="range"
                    min="10"
                    max="80"
                    value={swanPosition}
                    onChange={(e) => setSwanPosition(parseInt(e.target.value))}
                    className="w-full accent-emerald-400 h-2 bg-[#E5ECE5] rounded-lg cursor-pointer"
                  />
                </div>

                {swanPosition >= 75 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-sky-50 text-sky-700 text-center rounded-xl text-xs font-serif"
                  >
                    🌊 Swan reached the tranquil lake! Water ripples with soft joy. 🌊
                  </motion.div>
                )}

                <button
                  onClick={() => setSwanPosition(10)}
                  className="w-full py-1.5 bg-stone-50 hover:bg-stone-100 text-xs text-[#8A7171] border border-stone-200 rounded-full cursor-pointer transition-all interactive-obj"
                >
                  Reset Swan ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* 6. CATCH STRAWBERRIES */}
          {activeGame === 'strawberries' && (
            <motion.div
              key="strawberries"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7 bg-[#FFF8F9] rounded-2xl border border-pink-100 aspect-[16/10] w-full relative overflow-hidden shadow-inner p-4">
                
                {/* Catch teacup */}
                <div 
                  className="absolute bottom-4 w-16 h-12 bg-white border-2 border-pink-200 rounded-b-2xl rounded-t-sm shadow-md flex items-center justify-center font-bold text-[#ff808b] transition-all duration-100"
                  style={{ left: `${teacupX}%`, transform: 'translateX(-50%)' }}
                >
                  🥛🍵
                </div>

                {/* Render falling strawberries */}
                {activeBerries.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleCatchBerry(b.id)}
                    className="absolute text-2xl hover:scale-125 transition-transform cursor-pointer interactive-obj select-none"
                    style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    🍓
                  </button>
                ))}

                <div className="absolute bottom-3 left-4 font-garamond italic text-[10px] text-[#ff808b]">
                  "Use Left/Right buttons, Arrow Keys, or tap falling strawberries!"
                </div>
              </div>

              {/* Side controls */}
              <div className="md:col-span-5 flex flex-col gap-4 w-full">
                <div className="pb-2 border-b border-stone-100">
                  <h3 className="font-serif text-base font-bold text-[#5E3A3A]">Strawberry Teacup</h3>
                  <p className="text-[10px] text-[#8A7171] mt-0.5">Catch falling strawberries in the teacup or pop them with your tap.</p>
                </div>

                <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100/40 flex flex-col gap-2 items-center text-center">
                  <span className="text-[10px] font-serif uppercase tracking-wider text-[#8A7171]">Caught: {strawberryScore} berries</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => moveTeacup('left')}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#FFEBEB] border border-pink-100 rounded-full text-xs font-serif cursor-pointer interactive-obj"
                    >
                      ← Left
                    </button>
                    <button
                      onClick={() => moveTeacup('right')}
                      className="px-3.5 py-1.5 bg-white hover:bg-[#FFEBEB] border border-pink-100 rounded-full text-xs font-serif cursor-pointer interactive-obj"
                    >
                      Right →
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStrawberryScore(0);
                    setActiveBerries([
                      { id: 1, x: 25, y: -10, speed: 2.2 },
                      { id: 2, x: 55, y: -45, speed: 3.0 },
                      { id: 3, x: 75, y: -75, speed: 2.5 },
                    ]);
                  }}
                  className="w-full py-1.5 bg-[#FFF5F6] hover:bg-[#FFEBEB] text-xs text-[#ff808b] border border-pink-100 rounded-full cursor-pointer transition-all interactive-obj"
                >
                  Reset Strawberry Bowl ✕
                </button>
              </div>
            </motion.div>
          )}

          {/* 7. WRITE YOURSELF A LETTER */}
          {activeGame === 'letter' && (
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex flex-col md:grid md:grid-cols-12 gap-6 items-center"
            >
              <div className="md:col-span-7 bg-[#FFFBF7] rounded-2xl border border-amber-100 aspect-[16/10] w-full relative overflow-hidden shadow-inner p-4 flex flex-col justify-center items-center text-center">
                
                <AnimatePresence mode="wait">
                  {isLetterSent ? (
                    <motion.div
                      key="sent"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      className="flex flex-col items-center gap-3"
                    >
                      <span className="text-5xl animate-bounce">✈️☁️</span>
                      <h4 className="font-serif text-sm font-semibold text-[#5E3A3A]">Letter Released to the Clouds!</h4>
                      <p className="text-[10px] text-[#8A7171] max-w-xs leading-relaxed">
                        Your sweet wishes have been folded into a paper plane and set adrift. The universe remembers, and so will you.
                      </p>
                    </motion.div>
                  ) : (
                    <div className="w-full flex flex-col gap-2 p-2">
                      <span className="text-3xl animate-float-slow">✉️</span>
                      <h4 className="font-serif text-sm font-semibold text-[#5E3A3A]">Letter to Future Self</h4>
                      <textarea
                        maxLength={120}
                        rows={3}
                        value={letterText}
                        onChange={(e) => setLetterText(e.target.value)}
                        placeholder="e.g., I hope you are taking care of your skin, listening to good music, and smiling..."
                        className="w-full p-2 rounded-xl bg-white border border-[#ffd6d9] text-xs font-sans text-[#5E3A3A] resize-none focus:outline-none"
                      />
                    </div>
                  )}
                </AnimatePresence>

              </div>

              {/* Controls */}
              <div className="md:col-span-5 flex flex-col gap-4 w-full">
                <div className="pb-2 border-b border-stone-100">
                  <h3 className="font-serif text-base font-bold text-[#5E3A3A]">Wishes in the Wind</h3>
                  <p className="text-[10px] text-[#8A7171] mt-0.5">Write a future diary letter and launch it as a paper plane.</p>
                </div>

                {!isLetterSent ? (
                  <button
                    onClick={() => {
                      if (letterText.trim()) setIsLetterSent(true);
                    }}
                    disabled={!letterText.trim()}
                    className="w-full py-3 bg-[#ffb3b8] hover:bg-[#ff808b] disabled:opacity-50 text-white rounded-full font-serif text-xs tracking-wider cursor-pointer flex items-center justify-center gap-1.5 interactive-obj"
                  >
                    <Send className="w-4 h-4" />
                    Launch Paper Plane
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setLetterText('');
                      setIsLetterSent(false);
                    }}
                    className="w-full py-2 bg-stone-100 hover:bg-stone-200 text-[#8A7171] rounded-full text-xs font-serif cursor-pointer interactive-obj"
                  >
                    Write another letter
                  </button>
                )}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        <div className="border-t border-pink-100/40 pt-4 mt-6 text-center text-[10px] text-[#8A7171] font-serif">
          ✨ mysl's relaxing play cabinet • enjoy the serenity ✨
        </div>
      </div>
    </div>
  );
}
