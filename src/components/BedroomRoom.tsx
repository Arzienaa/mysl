import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, Moon, Monitor, Paintbrush, Flame, Flower2, HelpCircle } from 'lucide-react';

interface BedroomRoomProps {
  onTriggerPetals: () => void;
}

interface InteractiveObject {
  id: string;
  name: string;
  icon: string;
  position: string; // Tailwinds positioning relative to room container
  description: string;
}

const BEDROOM_OBJECTS: InteractiveObject[] = [
  { id: 'bed', name: 'Pink Bed 🛏️', icon: '🌸', position: 'top-[50%] left-[14%]', description: 'Cozy mattress with custom gingham covers.' },
  { id: 'teddy', name: 'Teddy Bears & Bunnies 🧸', icon: '🐰', position: 'top-[54%] left-[28%]', description: 'Cute snuggly friends with ribbon bows.' },
  { id: 'candle', name: 'Flickering Candle 🕯️', icon: '🕯️', position: 'top-[60%] left-[44%]', description: 'Warm vanilla glow.' },
  { id: 'flowers', name: 'White Lilies 💐', icon: '💐', position: 'top-[50%] left-[52%]', description: 'Fresh, fragrant lilies.' },
  { id: 'mirror', name: 'Large Mirror 🪞', icon: '✨', position: 'top-[22%] left-[61%]', description: 'Reflects cozy words and custom vintage stickers.' },
  { id: 'laptop', name: 'Laptop 💻', icon: '☕', position: 'top-[55%] left-[64%]', description: 'Simulated lo-fi bedroom scene.' },
  { id: 'tablet', name: 'Drawing Tablet ✏️', icon: '🎨', position: 'top-[66%] left-[72%]', description: 'Draw a tiny flower doodle on the screen.' },
  { id: 'perfume', name: 'Perfume 🧪', icon: '🎀', position: 'top-[58%] left-[80%]', description: 'Vintage scent bottle. Dispenses floating petals.' },
  { id: 'skincare', name: 'Skincare Shelf 🧴', icon: '🧴', position: 'top-[22%] left-[84%]', description: 'My routine: Cleanse, Tone, Glow.' },
];

const MIRROR_QUOTES = [
  "You look incredibly beautiful today.",
  "You are a work of art.",
  "Your soft heart is a superpower.",
  "Beautiful things take time to bloom.",
  "You deserve all the sweetness in the world.",
  "Always keep shining.",
];

export default function BedroomRoom({ onTriggerPetals }: BedroomRoomProps) {
  const [activeObj, setActiveObj] = useState<string | null>(null);
  
  // Bed customization state
  const [bedStyle, setBedStyle] = useState<'pink' | 'gingham' | 'lace'>('pink');
  const [isBunnyTucked, setIsBunnyTucked] = useState(false);

  // Mirror state
  const [mirrorQuoteIdx, setMirrorQuoteIdx] = useState(0);

  // Candle state
  const [isCandleLit, setIsCandleLit] = useState(true);

  // Skincare states
  const [skincareStep, setSkincareStep] = useState(0);

  // Tablet sketch state (stored as high-performance lists of lines)
  const [lines, setLines] = useState<{ x: number; y: number }[][]>([]);
  const [currentLine, setCurrentLine] = useState<{ x: number; y: number }[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // Laptop state
  const [laptopScreen, setLaptopScreen] = useState<'fireplace' | 'playlist'>('fireplace');

  const handleMirrorClick = () => {
    setMirrorQuoteIdx((prev) => (prev + 1) % MIRROR_QUOTES.length);
  };

  const handlePerfumeClick = () => {
    onTriggerPetals();
  };

  // High performance Canvas coordinates and handlers (prevent react lag on move)
  const getCanvasCoords = (clientX: number, clientY: number, currentTarget: HTMLCanvasElement) => {
    const rect = currentTarget.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * currentTarget.width;
    const y = ((clientY - rect.top) / rect.height) * currentTarget.height;
    return { x, y };
  };

  const startDrawing = (clientX: number, clientY: number, currentTarget: HTMLCanvasElement) => {
    setIsDrawing(true);
    const pos = getCanvasCoords(clientX, clientY, currentTarget);
    setCurrentLine([pos]);

    const ctx = currentTarget.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#ff808b';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.arc(pos.x, pos.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ff808b';
      ctx.fill();
    }
  };

  const drawMove = (clientX: number, clientY: number, currentTarget: HTMLCanvasElement) => {
    if (!isDrawing) return;
    const pos = getCanvasCoords(clientX, clientY, currentTarget);
    setCurrentLine((prev) => [...prev, pos]);

    const ctx = currentTarget.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#ff808b';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    if (currentLine.length > 0) {
      setLines((prev) => [...prev, currentLine]);
    }
    setCurrentLine([]);
  };

  // Keep drawing persistent on canvas mount
  React.useEffect(() => {
    if (activeObj === 'tablet' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#ff808b';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        lines.forEach(line => {
          if (line.length === 0) return;
          ctx.beginPath();
          ctx.moveTo(line[0].x, line[0].y);
          for (let i = 1; i < line.length; i++) {
            ctx.lineTo(line[i].x, line[i].y);
          }
          ctx.stroke();
        });
      }
    }
  }, [activeObj, lines]);

  return (
    <div className={`w-full max-w-5xl mx-auto px-4 py-8 transition-colors duration-1000 ${isCandleLit ? 'bg-[#FAF6F0]' : 'bg-[#EADECE]/80'} rounded-3xl p-6 md:p-8 border border-pink-100/40 relative shadow-sm`}>
      
      {/* Header */}
      <div className="text-center max-w-md mx-auto mb-10">
        <h1 className="font-serif text-3xl text-[#5E3A3A] tracking-wider">
          My Cozy Pinterest Bedroom
        </h1>
        <p className="font-garamond italic text-base text-[#8A7171] mt-1">
          "Step in, look around, and click on objects to explore or play with them."
        </p>
      </div>

      {/* Main room display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Interactive Room Canvas/Map (Left Side) */}
        <div className="lg:col-span-7 bg-[#FFFBF7] rounded-3xl border border-[#ffb3b8]/30 aspect-[4/3] relative overflow-hidden shadow-inner flex items-center justify-center p-4">
          
          {/* Aesthetic room backdrop illustration details */}
          <div className="absolute inset-0 bg-gradient-to-tr from-pink-100/20 via-transparent to-amber-100/10" />
          
          {/* Schematic visual items for spatial depth */}
          <div className="absolute bottom-0 inset-x-0 h-[35%] bg-stone-100/60 border-t border-stone-200/40" /> {/* Floor */}
          
          {/* Bed sketch background */}
          <div className={`absolute bottom-[12%] left-[6%] w-[40%] h-[38%] rounded-3xl border-2 border-[#ffd6d9] transition-all duration-500 shadow-md flex flex-col justify-between p-3 ${
            bedStyle === 'pink' ? 'bg-[#FFECEF]' : bedStyle === 'gingham' ? 'bg-[repeating-linear-gradient(45deg,#FFECEF,#FFECEF_10px,#FFF5F6_10px,#FFF5F6_20px)]' : 'bg-white border-dashed'
          }`}>
            <div className="flex justify-between items-start">
              <div className="w-12 h-6 bg-white rounded-lg border border-[#ffd6d9] shadow-sm flex items-center justify-center text-[10px] text-pink-400 font-serif">pillow</div>
              {isBunnyTucked && <span className="text-xl animate-bounce">🐰💤</span>}
            </div>
            <div className="text-right text-[10px] font-serif text-[#8A7171]">My Bed</div>
          </div>

          {/* Cozy Bedside Nightstand */}
          <div className="absolute bottom-[12%] left-[48%] w-[12%] h-[18%] bg-amber-50 border border-amber-200/80 rounded-xl shadow-sm flex flex-col justify-center items-center p-1">
            <div className="w-6 h-0.5 bg-amber-300 rounded mb-1" />
            <div className="text-[8px] font-serif text-amber-700/80">Table</div>
          </div>

          {/* Large Mirror outline */}
          <div className="absolute top-[10%] left-[58%] w-[18%] h-[36%] bg-[#FFF5F6] border-2 border-[#ffb3b8] rounded-t-full shadow-sm flex items-center justify-center flex-col overflow-hidden">
            <div className="absolute inset-1 rounded-t-full bg-sky-100/20 border border-white" />
            <span className="text-sm font-handwritten text-[#ff808b] animate-pulse">✨</span>
            <div className="text-[8px] font-serif text-pink-400 mt-1">Mirror</div>
          </div>

          {/* Skincare Wall Shelf */}
          <div className="absolute top-[14%] right-[6%] w-[20%] h-[18%] bg-stone-50 border border-stone-200/60 rounded flex flex-col justify-between items-center p-1 shadow-sm">
            <div className="w-full h-1 bg-stone-200/80 rounded-t" />
            <div className="text-[8px] font-serif text-stone-500">Routine Shelf</div>
          </div>

          {/* Table / Desk */}
          <div className="absolute bottom-[12%] right-[6%] w-[32%] h-[26%] bg-amber-50/70 border border-amber-200 rounded-xl shadow-sm flex flex-col justify-end p-2 text-right">
            <div className="text-[8px] font-serif text-[#8A7171]">Desk</div>
          </div>

          {/* Floating particle candle glow */}
          {isCandleLit && (
            <div className="absolute top-[56%] left-[44%] w-6 h-6 bg-amber-200/50 rounded-full blur-[10px] animate-pulse pointer-events-none" />
          )}

          {/* Render interactive pins */}
          {BEDROOM_OBJECTS.map((obj) => (
            <motion.button
              key={obj.id}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveObj(obj.id)}
              className={`absolute ${obj.position} w-11 h-11 rounded-full flex items-center justify-center text-xl shadow-md border cursor-pointer transition-all ${
                activeObj === obj.id
                  ? 'bg-[#ff808b] text-white border-white'
                  : 'bg-white hover:bg-[#FFEBEB] text-[#5E3A3A] border-[#ffd6d9]'
              } interactive-obj z-20`}
              title={obj.name}
            >
              <span>{obj.icon}</span>
            </motion.button>
          ))}

          {/* Interactive Tutorial helper tag */}
          <div className="absolute bottom-3 left-4 flex items-center gap-1.5 text-[10px] font-serif text-[#8A7171]">
            <HelpCircle className="w-3.5 h-3.5 text-[#ff808b]" />
            <span>Click any icon to interact</span>
          </div>
        </div>

        {/* Dynamic Detail Card / Interactive Area (Right Side) */}
        <div className="lg:col-span-5 h-full min-h-[380px]">
          <AnimatePresence mode="wait">
            {activeObj ? (
              <motion.div
                key={activeObj}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="glass-panel-deep p-6 rounded-3xl border border-[#ffb3b8]/40 h-full flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-pink-100">
                    <h3 className="font-serif text-lg font-semibold text-[#5E3A3A]">
                      {BEDROOM_OBJECTS.find(o => o.id === activeObj)?.name}
                    </h3>
                    <button
                      onClick={() => setActiveObj(null)}
                      className="text-xs font-serif text-[#ff808b] hover:underline cursor-pointer interactive-obj"
                    >
                      Close ✕
                    </button>
                  </div>

                  {/* Bed Interactions */}
                  {activeObj === 'bed' && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        A cozy bed makes a whole room peaceful. Select your favorite cover pattern and tuck my bunny in!
                      </p>
                      
                      <div className="flex flex-col gap-2">
                        <span className="text-[11px] font-serif uppercase tracking-wider text-[#8A7171]">Choose Cover Style:</span>
                        <div className="flex gap-2">
                          {(['pink', 'gingham', 'lace'] as const).map((style) => (
                            <button
                              key={style}
                              onClick={() => setBedStyle(style)}
                              className={`px-3 py-1.5 rounded-full text-xs font-serif transition-all border cursor-pointer interactive-obj ${
                                bedStyle === style
                                  ? 'bg-[#ffb3b8] text-white border-white shadow-sm'
                                  : 'bg-white text-[#5E3A3A] border-[#ffd6d9] hover:bg-[#FFEBEB]'
                              }`}
                            >
                              {style === 'pink' ? '🌸 Soft Pink' : style === 'gingham' ? '🎀 Pink Gingham' : '🦢 White Lace'}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4 p-4 rounded-2xl bg-pink-50/50 border border-pink-100 flex items-center justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-xs font-serif text-[#5E3A3A]">Snuggle bunny friend?</span>
                          <span className="text-[10px] text-[#8A7171]">Tuck the bunny under the covers.</span>
                        </div>
                        <button
                          onClick={() => setIsBunnyTucked(!isBunnyTucked)}
                          className={`px-3 py-1.5 rounded-full text-xs font-serif cursor-pointer interactive-obj ${
                            isBunnyTucked ? 'bg-pink-400 text-white' : 'bg-white text-pink-400 border border-pink-200'
                          }`}
                        >
                          {isBunnyTucked ? 'Tucked In 🐰💤' : 'Tuck Bunny 🐰'}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Mirror Interactions */}
                  {activeObj === 'mirror' && (
                    <div className="flex flex-col gap-5 items-center text-center">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        Look into the vintage wooden mirror. Tap the glass to reveal a secret beautiful reminder just for you.
                      </p>

                      <motion.div
                        key={mirrorQuoteIdx}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 rounded-2xl bg-gradient-to-tr from-[#FFF5F6] to-white border border-[#ffb3b8]/30 w-full min-h-[110px] flex items-center justify-center shadow-inner relative"
                      >
                        <div className="absolute top-2 right-3 text-pink-300">✦</div>
                        <p className="font-garamond italic text-base md:text-lg text-[#5E3A3A] font-medium leading-relaxed">
                          “{MIRROR_QUOTES[mirrorQuoteIdx]}”
                        </p>
                      </motion.div>

                      <button
                        onClick={handleMirrorClick}
                        className="px-4 py-2 bg-[#FFEBEB] hover:bg-[#ffd6d9] text-[#ff808b] font-serif text-xs tracking-wider rounded-full transition-all border border-pink-100 cursor-pointer interactive-obj"
                      >
                        Tap the glass ✨
                      </button>
                    </div>
                  )}

                  {/* Laptop Interactions */}
                  {activeObj === 'laptop' && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        My laptop. Toggle between playing a dreamy pixel-art bedroom fireplace, or inspecting my current Spotify loop.
                      </p>

                      <div className="flex gap-2">
                        <button
                          onClick={() => setLaptopScreen('fireplace')}
                          className={`px-3 py-1 text-xs rounded-full border cursor-pointer interactive-obj ${
                            laptopScreen === 'fireplace' ? 'bg-amber-100 border-amber-300 text-[#5E3A3A]' : 'bg-white text-[#8A7171] border-stone-200'
                          }`}
                        >
                          🔥 Fireplace Screen
                        </button>
                        <button
                          onClick={() => setLaptopScreen('playlist')}
                          className={`px-3 py-1 text-xs rounded-full border cursor-pointer interactive-obj ${
                            laptopScreen === 'playlist' ? 'bg-pink-100 border-pink-200 text-[#5E3A3A]' : 'bg-white text-[#8A7171] border-stone-200'
                          }`}
                        >
                          🎵 Music Loop
                        </button>
                      </div>

                      <div className="aspect-[16/10] bg-zinc-950 rounded-xl p-3 text-stone-200 font-mono text-xs border border-zinc-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
                        {laptopScreen === 'fireplace' ? (
                          <div className="flex flex-col h-full justify-between items-center text-center p-2">
                            <span className="text-2xl animate-bounce">🔥🪵</span>
                            <p className="text-[10px] text-amber-100/80 font-serif">A warm, soft fireplace loop. Feel the heat...</p>
                            <span className="text-[8px] text-stone-500">fireplace.html • running</span>
                          </div>
                        ) : (
                          <div className="flex flex-col h-full justify-between p-2 font-sans">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">🎵</span>
                              <div className="flex-1 overflow-hidden">
                                <p className="text-xs font-semibold truncate">Playing Games</p>
                                <p className="text-[9px] text-stone-400 truncate">Summer Walker</p>
                              </div>
                            </div>
                            <div className="w-full bg-stone-800 h-1 rounded-full overflow-hidden">
                              <motion.div
                                animate={{ width: ['0%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 10, ease: 'linear' }}
                                className="bg-pink-400 h-full"
                              />
                            </div>
                            <span className="text-[8px] text-stone-500 font-mono text-right">02:35 / 03:40</span>
                          </div>
                        )}
                        {/* Glass glossy screen shine */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  {/* Tablet Interactions */}
                  {activeObj === 'tablet' && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        Draw a tiny flower doodle directly onto the digital tablet! Drag or tap on the screen to see smooth pen ink flow.
                      </p>

                      <div className="relative border border-[#ffd6d9] rounded-2xl bg-white aspect-[16/10] overflow-hidden shadow-inner flex flex-col">
                        <canvas
                          ref={canvasRef}
                          width={600}
                          height={375}
                          onMouseDown={(e) => startDrawing(e.clientX, e.clientY, e.currentTarget)}
                          onMouseMove={(e) => drawMove(e.clientX, e.clientY, e.currentTarget)}
                          onMouseUp={endDrawing}
                          onMouseLeave={endDrawing}
                          onTouchStart={(e) => {
                            if (e.cancelable) e.preventDefault();
                            const touch = e.touches[0];
                            startDrawing(touch.clientX, touch.clientY, e.currentTarget);
                          }}
                          onTouchMove={(e) => {
                            if (e.cancelable) e.preventDefault();
                            const touch = e.touches[0];
                            drawMove(touch.clientX, touch.clientY, e.currentTarget);
                          }}
                          onTouchEnd={endDrawing}
                          className="w-full h-full cursor-crosshair bg-pink-50/5 block"
                        />

                        {/* Reset doodle */}
                        <button
                          onClick={() => {
                            setLines([]);
                            if (canvasRef.current) {
                              const ctx = canvasRef.current.getContext('2d');
                              if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
                            }
                          }}
                          className="absolute bottom-2 right-2 px-3 py-1 bg-[#ffb3b8] hover:bg-[#ff808b] text-white rounded-full text-[10px] font-serif cursor-pointer interactive-obj shadow-sm transition-all"
                        >
                          Clear canvas
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Skincare shelf */}
                  {activeObj === 'skincare' && (
                    <div className="flex flex-col gap-4">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        My daily skincare routine. Click through the steps to complete a virtual hydrating ritual.
                      </p>

                      <div className="p-4 rounded-2xl bg-[#FFF5F6] border border-[#ffb3b8]/30">
                        {skincareStep === 0 && (
                          <div className="flex flex-col items-center text-center gap-3">
                            <span className="text-3xl animate-bounce">🧼</span>
                            <h4 className="text-xs font-serif font-bold text-[#5E3A3A]">Step 1: Gentle Cleanser</h4>
                            <p className="text-[11px] text-[#8A7171]">Wash off all dust to prep the skin perfectly.</p>
                            <button
                              onClick={() => setSkincareStep(1)}
                              className="px-3 py-1.5 bg-[#ffb3b8] hover:bg-[#ff808b] text-white rounded-full text-xs font-serif interactive-obj"
                            >
                              Apply Cleanser ✨
                            </button>
                          </div>
                        )}
                        {skincareStep === 1 && (
                          <div className="flex flex-col items-center text-center gap-3">
                            <span className="text-3xl animate-bounce">💧</span>
                            <h4 className="text-xs font-serif font-bold text-[#5E3A3A]">Step 2: Hydrating Toner</h4>
                            <p className="text-[11px] text-[#8A7171]">Pat soft, soothing floral water onto skin cells.</p>
                            <button
                              onClick={() => setSkincareStep(2)}
                              className="px-3 py-1.5 bg-[#ffb3b8] hover:bg-[#ff808b] text-white rounded-full text-xs font-serif interactive-obj"
                            >
                              Pat Toner 🌿
                            </button>
                          </div>
                        )}
                        {skincareStep === 2 && (
                          <div className="flex flex-col items-center text-center gap-3">
                            <span className="text-3xl animate-bounce">✨</span>
                            <h4 className="text-xs font-serif font-bold text-[#5E3A3A]">Step 3: Strawberry Glow Moisturiser</h4>
                            <p className="text-[11px] text-[#8A7171]">Lock in water with an incredibly luxury glow.</p>
                            <button
                              onClick={() => setSkincareStep(3)}
                              className="px-3 py-1.5 bg-[#ffb3b8] hover:bg-[#ff808b] text-white rounded-full text-xs font-serif interactive-obj"
                            >
                              Smooth On Moisturizer 🍓
                            </button>
                          </div>
                        )}
                        {skincareStep === 3 && (
                          <div className="flex flex-col items-center text-center gap-3">
                            <span className="text-3xl">🌸🧖‍♀️✨</span>
                            <h4 className="text-xs font-serif font-bold text-[#5E3A3A]">All Done! Glow Radiant!</h4>
                            <p className="text-[11px] text-[#8A7171]">Your virtual face feels supple, soft, and smelling like lilies.</p>
                            <button
                              onClick={() => setSkincareStep(0)}
                              className="px-3 py-1.5 bg-[#ffebeb] hover:bg-[#ffd6d9] text-[#ff808b] rounded-full text-xs font-serif interactive-obj"
                            >
                              Do it again
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Perfume Interactions */}
                  {activeObj === 'perfume' && (
                    <div className="flex flex-col gap-4 text-center items-center">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        A gorgeous Parisian vintage crystal bottle of perfume. Scent notes: lily, sweet rose, fresh strawberries, and warm vanilla.
                      </p>

                      <div className="w-16 h-20 bg-[#FFF5F6] border-2 border-[#ffb3b8] rounded-2xl relative shadow-md flex items-center justify-center cursor-pointer interactive-obj hover:scale-105 transition-transform" onClick={handlePerfumeClick}>
                        <div className="absolute top-0 w-8 h-3 bg-yellow-400/60 border border-yellow-500/40 rounded-t-sm -translate-y-full" />
                        <span className="font-serif font-bold text-[#ff808b] text-xs">mysl.</span>
                        <div className="absolute -top-6 text-xl animate-bounce">🎀</div>
                      </div>

                      <button
                        onClick={handlePerfumeClick}
                        className="px-4 py-2 bg-[#ffb3b8] hover:bg-[#ff808b] text-white font-serif text-xs tracking-wider rounded-full transition-all border border-pink-100 cursor-pointer interactive-obj"
                      >
                        Squeeze atomiser 💨
                      </button>
                      <p className="text-[10px] text-[#8A7171] italic">Squeezing releases a flurry of soft pink petals across your screen!</p>
                    </div>
                  )}

                  {/* Candle Interactions */}
                  {activeObj === 'candle' && (
                    <div className="flex flex-col gap-4 text-center items-center">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        A beautiful handmade pink soy candle. It releases a soothing sweet aroma.
                      </p>

                      <div className="flex flex-col items-center">
                        <div className="relative">
                          {isCandleLit ? (
                            <motion.div
                              animate={{ scale: [1, 1.15, 1], y: [0, -1, 0] }}
                              transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                              className="w-5 h-7 bg-amber-400 rounded-full blur-[2px] absolute -top-8 left-1/2 -translate-x-1/2"
                            />
                          ) : null}
                          <div className="w-10 h-12 bg-pink-100 border border-pink-200 rounded-md" />
                        </div>
                      </div>

                      <button
                        onClick={() => setIsCandleLit(!isCandleLit)}
                        className={`px-4 py-2 font-serif text-xs tracking-wider rounded-full transition-all cursor-pointer interactive-obj ${
                          isCandleLit ? 'bg-amber-100 text-amber-700 border-amber-300' : 'bg-pink-100 text-pink-700 border-pink-200'
                        }`}
                      >
                        {isCandleLit ? 'Extinguish Candle 🕯️' : 'Light Candle ✨'}
                      </button>
                    </div>
                  )}

                  {/* Teddy Bears */}
                  {activeObj === 'teddy' && (
                    <div className="flex flex-col gap-4 text-center items-center">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        My adorable snuggly bedroom toys! Meet Clover the bunny and Ribbon the teddy bear.
                      </p>

                      <div className="flex gap-6 justify-center">
                        <motion.div
                          whileTap={{ scale: 0.9, rotate: [0, -10, 10, 0] }}
                          className="w-16 h-16 bg-[#F5EBE0] border border-stone-200 rounded-2xl flex items-center justify-center text-3xl cursor-pointer shadow-sm relative group interactive-obj"
                        >
                          🧸
                          <div className="absolute bottom-1 text-[8px] text-stone-500 font-serif">Ribbon</div>
                        </motion.div>
                        <motion.div
                          whileTap={{ scale: 0.9, rotate: [0, 10, -10, 0] }}
                          className="w-16 h-16 bg-white border border-pink-100 rounded-2xl flex items-center justify-center text-3xl cursor-pointer shadow-sm relative group interactive-obj"
                        >
                          🐰
                          <div className="absolute bottom-1 text-[8px] text-pink-400 font-serif">Clover</div>
                        </motion.div>
                      </div>

                      <p className="text-[10px] text-[#8A7171] italic leading-relaxed">
                        Tap clover or ribbon to make them bounce and squeak with joy!
                      </p>
                    </div>
                  )}

                  {/* Flowers */}
                  {activeObj === 'flowers' && (
                    <div className="flex flex-col gap-4 text-center items-center">
                      <p className="text-xs text-[#7A6060] leading-relaxed">
                        A gorgeous crystal vase of white lilies. They always fill my bedroom with sweet scent and serene energy.
                      </p>

                      <motion.div
                        animate={{ rotate: [-2, 2, -2] }}
                        transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                        className="text-4xl"
                      >
                        💐
                      </motion.div>

                      <p className="font-garamond italic text-sm text-[#8A7171] max-w-xs leading-relaxed">
                        “The earth laughs in flowers.”
                      </p>
                    </div>
                  )}
                </div>

                <div className="text-center text-[10px] text-[#8A7171] font-serif border-t border-pink-100/40 pt-4 mt-6">
                  ✨ mysl's secret sanctuary room ✨
                </div>
              </motion.div>
            ) : (
              <div className="glass-panel p-6 rounded-3xl border border-[#ffb3b8]/20 h-full flex flex-col justify-center items-center text-center text-[#8A7171]">
                <Flower2 className="w-8 h-8 text-[#ffb3b8] animate-sway mb-3" />
                <h3 className="font-serif text-lg font-medium text-[#5E3A3A] mb-1">
                  Cozy Corner
                </h3>
                <p className="text-xs max-w-xs leading-relaxed">
                  Hover or tap any pin in my room diagram to customize furniture, draw sketches, lit soy candles, dispense perfume scent waves, or get secret motivators.
                </p>
              </div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
