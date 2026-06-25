import React from 'react';
import { Product, Category } from '../types';
import { motion } from 'motion/react';
import { HeroSection } from './HeroSection';

interface ProductListProps {
  categories: Category[];
  products: Product[];
  onAddToCart: (product: Product) => void;
  searchQuery?: string;
}

export function ProductList({ categories, products, onAddToCart, searchQuery }: ProductListProps) {
  return (
    <div className="w-full flex justify-center flex-col">
      {!searchQuery && <HeroSection />}
      
      <div className="max-w-6xl mx-auto p-4 w-full space-y-16 pb-24 mt-8">
        {searchQuery && (
          <div className="mb-4 text-center">
            <h2 className="text-2xl font-bold text-white">
              Resultados para: <span className="text-[#FFD700]">"{searchQuery}"</span>
            </h2>
            {products.length === 0 && (
              <p className="text-zinc-400 mt-4">Nenhum produto encontrado.</p>
            )}
          </div>
        )}

        {categories.map(category => {
          const categoryProducts = products.filter(p => p.categoryId === category.id);
          
          if (categoryProducts.length === 0) return null;

          return (
            <motion.section 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              key={category.id} 
              className="pt-4"
            >
              <h2 className="flex items-center gap-4 mb-8">
                <span className="text-[#D32F2F] font-black uppercase text-xl md:text-2xl tracking-widest pl-2">
                  {category.name}
                </span>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-[#D32F2F]/40 my-auto to-transparent max-w-sm rounded"></div>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {categoryProducts.map((product, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.4, delay: 0.05 * (idx % 3) }}
                    key={product.id} 
                    className="bg-[#1A1A1A] border-2 border-[#333333] rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-[#FFD700] transition-all duration-300 hover:-translate-y-1 relative shadow-[0_4px_15px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_25px_rgba(255,215,0,0.15)]"
                  >
                    {product.imageUrl ? (
                      <div className="h-32 md:h-48 bg-[#111111] w-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                      </div>
                    ) : (
                      <div className="h-32 md:h-48 bg-[#2A2A2A] flex items-center justify-center text-5xl md:text-7xl border-b-2 border-[#333333] group-hover:bg-[#333333] transition-colors">
                        <span className="drop-shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                          {category.name.toLowerCase().includes('bebida') ? '🥤' : category.name.toLowerCase().includes('porç') ? '🍟' : category.name.toLowerCase().includes('xis') ? '🍔' : '🌭'}
                        </span>
                      </div>
                    )}
                    <div className="p-3 md:p-5 flex flex-col flex-1 bg-gradient-to-b from-[#1A1A1A] to-[#111111]">
                      <h3 className="font-bold text-base md:text-lg text-white group-hover:text-[#FFD700] transition-colors leading-tight">{product.name}</h3>
                      <p className="text-xs text-zinc-400 flex-1 mt-2 mb-4 line-clamp-2 leading-relaxed">
                        {product.description || (category.name.toLowerCase().includes('bebida') ? 'Selecione os detalhes no chat e verifique a disponibilidade.' : 'Delicioso e feito na hora.')}
                      </p>
                      <div className="flex justify-between items-end mt-auto pt-3 border-t border-[#333333]">
                        <div className="flex flex-col">
                          <span className="text-[9px] md:text-[10px] text-zinc-500 uppercase font-bold tracking-widest mb-0.5">A partir de</span>
                          <span className="font-black text-lg md:text-2xl text-[#D32F2F]">
                            R$ {product.price.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <button 
                          onClick={() => onAddToCart(product)}
                          className="bg-[#D32F2F] text-white w-9 h-9 md:w-12 md:h-12 rounded-xl font-black text-xl md:text-2xl hover:bg-[#FFD700] hover:text-[#1A1A1A] hover:scale-105 active:scale-95 transition-all flex items-center justify-center shadow-[0_4px_0_#9A0007] hover:shadow-[0_2px_0_#B29600] hover:translate-y-[2px] z-10"
                          title="Adicionar ao Carrinho"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}
      </div>
    </div>
  );
}

