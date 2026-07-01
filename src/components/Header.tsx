import React from 'react';
import { ShoppingBag, Search } from 'lucide-react';
import { User } from 'firebase/auth';

const logoUrl = '/logo.jpeg';

interface HeaderProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onNavigate: (view: 'home' | 'admin') => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showSearch?: boolean;
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
}

export function Header({ 
  cartItemCount, 
  onOpenCart, 
  onNavigate, 
  searchQuery, 
  onSearchChange, 
  showSearch,
  user,
  onLogin,
  onLogout
}: HeaderProps) {
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
                alt="Point Dog Logo" 
                className="h-full w-full object-cover transition-transform group-hover:scale-110"
              />
            </div>
            <div className="flex flex-col justify-center">
              <div className="text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white group-hover:text-[#FFD700] transition-colors leading-none">
                POINT <span className="text-[#FFD700] group-hover:text-white transition-colors">DOG</span>
              </div>
              <div className="text-[#D32F2F] font-bold text-xs md:text-sm tracking-widest uppercase mt-0.5">
                O melhor de Passo Fundo
              </div>
            </div>
          </div>
          
          <div className="md:hidden flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-1.5 bg-[#2A2A2A] border border-[#333] px-2 py-1 rounded-full">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'Usuário'} 
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-[#FFD700]"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-[#FFD700]">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <button 
                  onClick={onLogout}
                  className="text-[#D32F2F] text-[9px] font-black uppercase tracking-wider pr-0.5"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={onLogin}
                className="flex items-center gap-1 px-2.5 py-1.5 bg-white text-black hover:bg-[#FFD700] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-[0_3px_0_#CCCCCC]"
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                Login
              </button>
            )}

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

          {user ? (
            <div className="flex items-center gap-3 bg-[#2A2A2A] border border-[#333] px-3 py-1.5 rounded-full shadow-inner">
              {user.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={user.displayName || 'Usuário'} 
                  referrerPolicy="no-referrer"
                  className="w-7 h-7 rounded-full object-cover border border-[#FFD700]"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-[#FFD700] border border-[#333]">
                  {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-white text-xs font-black max-w-[85px] truncate leading-none">
                  {user.displayName?.split(' ')[0] || 'Cliente'}
                </span>
                <button 
                  onClick={onLogout}
                  className="text-[#D32F2F] hover:text-white text-[9px] font-bold uppercase tracking-wider text-left mt-0.5 cursor-pointer transition-colors"
                >
                  Sair
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-black hover:bg-[#FFD700] hover:text-[#1A1A1A] rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 shadow-[0_4px_0_#CCCCCC] hover:shadow-[0_2px_0_#B38F00] active:translate-y-[2px] cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Entrar com Google
            </button>
          )}
          
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

