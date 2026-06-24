import React from 'react';
import { ShoppingBag, Search } from 'lucide-react';

const logoUrl = '/logo.jpeg';

interface HeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'home' | 'admin') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
}

export function Header({ cartItemCount, onOpenCart, onNavigate, searchQuery, onSearchChange, showSearch }: HeaderProps) {
  return (
    <header className="bg-[#1A1A1A]/95 backdrop-blur-md px-4 pb-4 pt-[calc(1rem+env(safe-area-inset-top))] sticky top-0 z-40 border-b-4 border-[#D32F2F] shadow-[0_10px_30px_rgba(211,47,47,0.15)]">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex w-full md:w-auto justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onNavigate('home')}
          >
            <div className="h-12 w-12 md:h-16 md:w-16 shrink-0 rounded-full overflow-hidden border-2 border-[#FFD700] shadow-[0_0_10px_rgba(255,215,0,0.5)]">
              <img 
                src={logoUrl} 
                alt="Point do Dog PF Logo" 
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white group-hover:text-[#FFD700] transition-colors leading-none">
                POINT DO <span className="text-[#FFD700] group-hover:text-white transition-colors">DOG</span>
              </div>
              <div className="text-[#D32F2F] font-bold text-xs md:text-sm tracking-widest uppercase mt-0.5">
                O melhor de Passo Fundo
              </div>
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-4">
            <button 
              onClick={onOpenCart}
              className="relative p-2.5 bg-[#D32F2F] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_4px_0_#9A0007] hover:shadow-[0_2px_0_#9A0007] hover:translate-y-[2px]"
            >
              <ShoppingBag size={22} strokeWidth={2.5} />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-[#FFD700] text-[#1A1A1A] border-2 border-[#1A1A1A] text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {showSearch && (
          <div className="w-full md:flex-1 md:max-w-sm mx-auto md:mx-4 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => onSearchChange?.(e.target.value)}
              placeholder="Buscar lanches..." 
              className="w-full bg-[#2A2A2A] border-2 border-[#333333] rounded-full pl-11 pr-4 py-2.5 text-sm text-white focus:outline-none focus:ring-0 focus:border-[#FFD700] transition-all font-medium placeholder:text-zinc-500 shadow-inner"
            />
          </div>
        )}
        
        <div className="hidden md:flex items-center gap-4 md:gap-6 shrink-0">
          <div className="flex flex-col items-end mr-2">
            <span className="bg-[#4CAF50]/20 text-[#4CAF50] border border-[#4CAF50]/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-[0_0_10px_rgba(76,175,80,0.2)]">
              Delivery Aberto
            </span>
            <span className="text-[#FFD700] text-[10px] uppercase font-bold tracking-wider mt-1">
              Atendimento até 23h
            </span>
          </div>
          
          <button 
            onClick={onOpenCart}
            className="relative p-3 bg-[#D32F2F] text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-[0_6px_0_#9A0007] hover:shadow-[0_2px_0_#9A0007] hover:translate-y-[4px] ml-2"
          >
            <ShoppingBag size={24} strokeWidth={2.5} />
            {cartItemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FFD700] text-[#1A1A1A] border-2 border-[#1A1A1A] text-xs font-black w-6 h-6 flex items-center justify-center rounded-full shadow-sm">
                {cartItemCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

