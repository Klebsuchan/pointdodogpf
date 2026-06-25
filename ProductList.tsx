import React, { useEffect, useState, useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';

const FLAVORS = ['🌭', '🍔'];

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 150]);
  
  const [dimensions, setDimensions] = useState({ width: 1000, height: 800 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    setMounted(true);
    
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden min-h-[75vh] flex items-center justify-center bg-[#0a0a0a]">
      {/* Unique Animated Background */}
      {mounted && (
        <div className="absolute inset-0 z-0 overflow-hidden [mask-image:linear-gradient(to_bottom,black_60%,transparent_95%)]">
          {/* Animated Gradient Blobs */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              x: [0, 100, 0],
              y: [0, -50, 0],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#D32F2F]/20 blur-[120px] mix-blend-screen"
          />
          <motion.div
            animate={{
              scale: [1, 1.5, 1],
              x: [0, -100, 0],
              y: [0, 100, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] rounded-full bg-[#FFD700]/15 blur-[120px] mix-blend-screen"
          />
          
          {/* Abstract Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_20%,transparent_100%)]"></div>
          
          {/* Falling Elements */}
          <div className="relative w-full max-w-7xl h-full mx-auto">
            {[...Array(25)].map((_, i) => {
              const startX = Math.random() * 100; // percentage
              const duration = 12 + Math.random() * 20;
              const delay = Math.random() * -25; // negative delay so they start already on screen
              const size = 30 + Math.random() * 50; // emoji size
              
              return (
                <motion.div
                  key={i}
                  initial={{ y: -150, x: `${startX}vw`, rotate: 0, opacity: 0 }}
                  animate={{ 
                    y: dimensions.height + 250, 
                    rotate: 360,
                    opacity: [0, 0.45, 0.45, 0]
                  }}
                  transition={{ 
                    duration: duration, 
                    repeat: Infinity, 
                    ease: "linear",
                    delay: delay,
                    opacity: {
                      duration: duration,
                      repeat: Infinity,
                      ease: "easeInOut",
                      times: [0, 0.2, 0.8, 1]
                    }
                  }}
                  className="absolute select-none pointer-events-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
                  style={{ fontSize: size }}
                >
                  {FLAVORS[i % FLAVORS.length]}
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay to ensure text readability */}
      <div className="absolute inset-0 bg-black/40 z-0 pointer-events-none"></div>
      
      {/* Content */}
      <motion.div 
        style={{ y: y1 }}
        className="text-center py-16 md:py-24 px-4 flex flex-col items-center justify-center relative z-10 w-full max-w-4xl mx-auto"
      >
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#4CAF50]/10 border border-[#4CAF50]/30 text-[#4CAF50] text-xs font-black uppercase tracking-widest backdrop-blur-sm shadow-[0_0_15px_rgba(76,175,80,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#4CAF50] animate-pulse shadow-[0_0_8px_rgba(76,175,80,0.8)]"></span>
            DELIVERY ABERTO
          </div>
          <span className="text-[#FFD700] text-xs font-bold uppercase tracking-widest">
            Atendimento até as 23hs
          </span>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl sm:text-7xl md:text-8xl font-black italic tracking-tighter uppercase text-white mb-6 drop-shadow-[0_4px_20px_rgba(0,0,0,0.5)] leading-[0.9]"
        >
          Sabor de <span className="text-[#FFD700] drop-shadow-[0_0_20px_rgba(255,215,0,0.4)]">Verdade</span> <br /> Na Sua Casa
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="text-zinc-300 font-medium max-w-2xl mx-auto text-lg md:text-2xl leading-relaxed tracking-wide mb-10 drop-shadow-lg"
        >
          Descubra os melhores <span className="text-[#D32F2F] font-bold">cachorros-quentes e hambúrgueres</span> com entrega rápida. Faça seu pedido e conclua direto pelo WhatsApp!
        </motion.p>
      </motion.div>
    </div>
  );
}
