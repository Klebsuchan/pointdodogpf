import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { Header } from './components/Header';
import { ProductList } from './components/ProductList';
import { CartDrawer } from './components/CartDrawer';
import { AdminPanel } from './components/AdminPanel';
import { PolicyModal } from './components/PolicyModal';
import { CartItem, Product } from './types';
import toast, { Toaster } from 'react-hot-toast';
import { onAuthStateChanged, signInWithPopup, GoogleAuthProvider, signOut, User } from 'firebase/auth';
import { auth } from './firebase';

const normalizeText = (text: string) => {
  if (!text) return '';
  return text.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/-/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

export default function App() {
  const { 
    products, 
    categories, 
    settings, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    updateSettings 
  } = useStore();

  const [view, setView] = useState<'home' | 'admin'>('home');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activePolicy, setActivePolicy] = useState<'cookies' | 'privacy' | 'delivery' | null>(null);

  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      toast.success('Login efetuado com sucesso!', {
        style: {
          background: '#0A0A0A',
          color: '#fff',
          border: '1px solid #1A1A1A',
          borderRadius: '16px',
          fontWeight: 'bold',
        },
      });
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao fazer login com Google: ' + error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Sessão encerrada com sucesso!');
    } catch (error: any) {
      console.error(error);
      toast.error('Erro ao sair: ' + error.message);
    }
  };

  const handleAddToCart = (product: Product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
    
    // Mostra um toast ao invez de abrir o drawer toda vez
    toast.success(`${product.name} adicionado ao carrinho!`, {
      style: {
        background: '#0A0A0A',
        color: '#fff',
        border: '1px solid #1A1A1A',
        borderRadius: '16px',
        fontWeight: 'bold',
      },
      iconTheme: {
        primary: '#DC2626',
        secondary: '#000',
      },
    });
  };

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCartItems(prev => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const totalCartItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="min-h-screen bg-black text-white font-sans flex flex-col relative">
      {/* Premium Background Accent */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-zinc-900/30 via-black to-black mix-blend-screen transition-opacity duration-1000"></div>
      
      <div className="relative z-10 flex flex-col min-h-screen">
        <Header 
          cartItemCount={totalCartItems} 
          onOpenCart={() => setIsCartOpen(true)} 
          onNavigate={setView}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showSearch={view === 'home'}
          user={user}
          onLogin={handleGoogleLogin}
          onLogout={handleLogout}
        />

        <main className="flex-1">
          {view === 'home' ? (
            <ProductList 
              categories={categories} 
              products={products.filter(p => {
                const search = normalizeText(searchQuery);
                if (!search) return true;
                return normalizeText(p.name).includes(search) || 
                       normalizeText(p.description || '').includes(search);
              })} 
              onAddToCart={handleAddToCart} 
              searchQuery={searchQuery}
            />
          ) : (
            <AdminPanel 
              products={products}
              categories={categories}
              settings={settings}
              onAddProduct={addProduct}
              onUpdateProduct={updateProduct}
              onDeleteProduct={deleteProduct}
              onUpdateSettings={updateSettings}
              user={user}
              onGoogleLogin={handleGoogleLogin}
            />
          )}
        </main>

        <CartDrawer 
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cartItems={cartItems}
          onUpdateQuantity={handleUpdateQuantity}
          settings={settings}
          user={user}
          onReorder={setCartItems}
        />

        <footer className="bg-[#050505] pt-16 pb-[calc(4rem+env(safe-area-inset-bottom))] border-t border-zinc-900 mt-auto relative z-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col items-center">
            
            {/* Branding & Subtitle */}
            <div className="text-center mb-8">
              <p className="text-zinc-400 font-extrabold text-lg tracking-widest uppercase mb-2">
                Point <span className="text-[#DC2626]">Dog</span>
              </p>
              <p className="text-zinc-500 text-xs md:text-sm max-w-sm mx-auto">
                O melhor cachorro-quente de Passo Fundo. Feito com ingredientes selecionados.
              </p>
            </div>

            {/* Policies Selection */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mb-8 text-zinc-400 text-xs font-semibold uppercase tracking-wider">
              <button 
                onClick={() => setActivePolicy('cookies')} 
                className="hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                Política de Cookies
              </button>
              <span className="text-zinc-850 hidden sm:inline">•</span>
              <button 
                onClick={() => setActivePolicy('privacy')} 
                className="hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                Política de Privacidade
              </button>
              <span className="text-zinc-850 hidden sm:inline">•</span>
              <button 
                onClick={() => setActivePolicy('delivery')} 
                className="hover:text-[#DC2626] transition-colors cursor-pointer"
              >
                Política de Delivery
              </button>
            </div>

            {/* Divider */}
            <div className="w-full max-w-lg h-[1px] bg-zinc-900/60 mb-8" />

            {/* Credits and Copyrights */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full max-w-4xl gap-4 text-center md:text-left text-xs text-zinc-500">
              <div>
                <p>© {new Date().getFullYear()} Point Dog Delivery. Todos os direitos reservados.</p>
                <p className="mt-1 text-zinc-600">
                  Desenvolvedor{' '}
                  <a 
                    href="https://portfolio-braian-three.vercel.app/" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-[#DC2626] hover:underline font-bold transition-all duration-200"
                  >
                    Braian Kmdc
                  </a>
                </p>
              </div>

              <div>
                <button 
                  onClick={() => setView('admin')} 
                  className="px-4 py-2 bg-zinc-950/80 hover:bg-zinc-900 text-zinc-400 hover:text-[#DC2626] hover:border-zinc-800 transition-all duration-200 uppercase tracking-widest font-extrabold text-[10px] rounded-lg border border-zinc-900/80"
                >
                  Área do Administrador
                </button>
              </div>
            </div>

          </div>
        </footer>
      </div>

      <PolicyModal type={activePolicy} onClose={() => setActivePolicy(null)} />

      {/* Floating WhatsApp Button */}
      <a
        href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white p-4 rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all duration-300 flex items-center justify-center group"
        title="Falar no WhatsApp"
      >
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      <Toaster position="bottom-center" toastOptions={{ duration: 2500 }} />
    </div>
  );
}
