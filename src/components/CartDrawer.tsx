import React, { useState, useEffect } from 'react';
import { X, Plus, Minus, Send, Trash2, Clock, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { CartItem, StoreSettings } from '../types';
import { User } from 'firebase/auth';
import { getDoc, doc, setDoc, addDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  settings: StoreSettings;
  user: User | null;
  onReorder?: (items: CartItem[]) => void;
}

export function CartDrawer({ isOpen, onClose, cartItems, onUpdateQuantity, settings, user, onReorder }: CartDrawerProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [reference, setReference] = useState('');
  const [payment, setPayment] = useState('Pix');
  const [deliveryMethod, setDeliveryMethod] = useState('Delivery');
  const [notes, setNotes] = useState('');
  const [needsChange, setNeedsChange] = useState(false);
  const [changeFor, setChangeFor] = useState('');

  const [orders, setOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load user profile info when user is available
  useEffect(() => {
    if (user) {
      const fetchUserInfo = async () => {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            const data = userDoc.data();
            if (data.name) setName(data.name);
            if (data.phone) setPhone(data.phone);
            if (data.street) setStreet(data.street);
            if (data.neighborhood) setNeighborhood(data.neighborhood);
            if (data.reference) setReference(data.reference);
            if (data.deliveryMethod) setDeliveryMethod(data.deliveryMethod);
            if (data.payment) setPayment(data.payment);
            if (data.needsChange !== undefined) setNeedsChange(data.needsChange);
            if (data.changeFor) setChangeFor(data.changeFor);
            if (data.notes) setNotes(data.notes);
          } else {
            if (user.displayName) {
              setName(user.displayName);
            }
          }
        } catch (error) {
          console.error("Erro ao carregar dados do usuário: ", error);
        }
      };
      fetchUserInfo();
    }
  }, [user]);

  const fetchUserOrders = async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const q = query(
        collection(db, 'orders'),
        where('userId', '==', user.uid)
      );
      const querySnapshot = await getDocs(q);
      const ordersList: any[] = [];
      querySnapshot.forEach((doc) => {
        ordersList.push({ id: doc.id, ...doc.data() });
      });
      // Sort client-side by createdAt descending to avoid composite index requirement
      ordersList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setOrders(ordersList);
    } catch (error) {
      console.error("Erro ao carregar pedidos anteriores: ", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      fetchUserOrders();
    }
  }, [user, isOpen]);

  const handleReorder = (order: any) => {
    if (!onReorder) return;
    
    const reconstructedCartItems: CartItem[] = order.items.map((item: any) => ({
      product: {
        id: item.productId,
        name: item.productName,
        price: item.price,
        categoryId: '',
      },
      quantity: item.quantity
    }));

    onReorder(reconstructedCartItems);
    toast.success('Itens do pedido anterior adicionados ao carrinho!', {
      style: {
        background: '#0A0A0A',
        color: '#fff',
        border: '1px solid #1A1A1A',
        borderRadius: '16px',
        fontWeight: 'bold',
      },
    });
  };

  const total = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (cartItems.length === 0) return;

    let message = `*Novo Pedido - Point Dog* 🌭\n\n`;
    message += `*Cliente:* ${name}\n`;
    message += `*Telefone:* ${phone}\n\n`;
    message += `*Método de Entrega:* ${deliveryMethod}\n`;
    
    if (deliveryMethod === 'Delivery') {
      message += `\n*Endereço de Entrega:*\n`;
      message += `*Rua/Número:* ${street}\n`;
      message += `*Bairro:* ${neighborhood}\n`;
      if (reference) {
        message += `*Ponto de Referência:* ${reference}\n`;
      }
    }
    
    message += `\n*Pagamento:* ${payment}\n`;
    if (payment === 'Dinheiro' && needsChange && changeFor) {
      message += `*Troco para:* ${changeFor}\n`;
    }
    message += `\n*Pedido:*\n`;
    
    cartItems.forEach(item => {
      message += `${item.quantity}x ${item.product.name} - R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}\n`;
    });

    if (notes) {
      message += `\n*Observações (retirar itens, etc):* ${notes}\n`;
    }

    message += `\n*Total:* R$ ${total.toFixed(2).replace('.', ',')} + taxa de entrega\n`;
    message += `_(A taxa de entrega será combinada com o entregador)_`;

    // Save user checkout profile and order in Firestore if logged in
    if (user) {
      try {
        // Save profile
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
          name,
          phone,
          street,
          neighborhood,
          reference,
          deliveryMethod,
          payment,
          needsChange,
          changeFor,
          notes,
          updatedAt: new Date().toISOString()
        }, { merge: true });

        // Save order
        const orderData = {
          userId: user.uid,
          userEmail: user.email,
          userName: name,
          userPhone: phone,
          items: cartItems.map(item => ({
            productId: item.product.id,
            productName: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
          total: total,
          deliveryMethod: deliveryMethod,
          street: deliveryMethod === 'Delivery' ? street : '',
          neighborhood: deliveryMethod === 'Delivery' ? neighborhood : '',
          reference: deliveryMethod === 'Delivery' ? reference : '',
          payment: payment,
          needsChange: payment === 'Dinheiro' ? needsChange : false,
          changeFor: (payment === 'Dinheiro' && needsChange) ? changeFor : '',
          notes: notes,
          createdAt: new Date().toISOString(),
          status: 'Pendente'
        };

        await addDoc(collection(db, 'orders'), orderData);
        // Refresh orders list
        fetchUserOrders();
      } catch (error) {
        console.error("Erro ao salvar dados do pedido no Firestore: ", error);
      }
    }

    const encodedMessage = encodeURIComponent(message);
    const waUrl = `https://wa.me/${settings.whatsappNumber}?text=${encodedMessage}`;
    
    window.open(waUrl, '_blank');
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/80 z-40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-[#0A0A0A] z-50 shadow-2xl flex flex-col transform transition-transform overflow-hidden border-l border-[#1A1A1A]">
        <div className="bg-[#111111] text-[#FFD700] p-5 flex justify-between items-center shrink-0 border-b border-[#333333]">
          <h2 className="text-xl font-black uppercase flex items-center gap-2">
            Seu Pedido
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-[#222222] rounded-lg transition-colors text-zinc-500 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6 bg-[#1A1A1A] custom-scroll">
          {cartItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-zinc-500 flex-col gap-4 py-8">
              <ShoppingBagIcon className="w-16 h-16 opacity-50" />
              <p className="font-medium">Seu carrinho está vazio.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {cartItems.map(item => (
                <div key={item.product.id} className="bg-[#222222] p-4 rounded-2xl border border-[#333333] flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-white">{item.product.name}</h4>
                    <p className="font-black text-[#FFD700] text-sm mt-1">
                      R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-3 bg-[#111111] rounded-xl p-1 border border-[#333333]">
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, -1)}
                      className="text-zinc-500 hover:text-[#D32F2F] hover:bg-[#2A2A2A] p-2 rounded-lg transition-colors"
                    >
                      {item.quantity === 1 ? <Trash2 size={16} className="text-[#D32F2F] hover:text-red-400" /> : <Minus size={16} />}
                    </button>
                    <span className="font-bold text-sm w-6 text-center text-white">{item.quantity}</span>
                    <button 
                      onClick={() => onUpdateQuantity(item.product.id, 1)}
                      className="text-zinc-500 hover:text-[#FFD700] hover:bg-[#2A2A2A] p-2 rounded-lg transition-colors"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Past Orders History Section */}
          {user && (
            <div className="mt-2 border-t border-zinc-800/80 pt-4 pb-2 shrink-0">
              <button 
                type="button"
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="w-full flex items-center justify-between text-xs font-black text-zinc-400 uppercase tracking-widest hover:text-[#FFD700] transition-colors py-1 cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Clock size={14} className="text-[#FFD700]" />
                  Meus Últimos Pedidos ({orders.length})
                </span>
                {isHistoryOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>

              {isHistoryOpen && (
                <div className="mt-3 space-y-3">
                  {loadingOrders ? (
                    <p className="text-zinc-500 text-xs italic">Carregando histórico...</p>
                  ) : orders.length === 0 ? (
                    <p className="text-zinc-500 text-xs italic">Nenhum pedido anterior encontrado.</p>
                  ) : (
                    orders.map((order) => (
                      <div key={order.id} className="bg-[#111111] border border-zinc-900 rounded-2xl p-3.5 space-y-2 text-zinc-300">
                        <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                          <span className="text-zinc-500 font-bold text-[10px]">
                            {new Date(order.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          <span className="font-black text-[#FFD700]">
                            R$ {order.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        
                        <div className="space-y-1 text-xs">
                          {order.items?.map((item: any, idx: number) => (
                            <div key={idx} className="flex justify-between font-medium">
                              <span>{item.quantity}x {item.productName}</span>
                              <span className="text-zinc-500">R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}</span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="bg-[#181818] px-2 py-1.5 rounded-lg border border-zinc-800 text-[10px] text-zinc-400 italic">
                            Obs: {order.notes}
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => handleReorder(order)}
                          className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-[#1C1C1C] hover:bg-[#FFD700] hover:text-[#1A1A1A] text-white rounded-xl font-black uppercase tracking-wider text-[10px] transition-all cursor-pointer"
                        >
                          <RotateCcw size={12} />
                          Repetir este Pedido
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {cartItems.length > 0 && (
            <form onSubmit={handleCheckout} className="mt-auto bg-[#D32F2F] px-6 pt-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] rounded-3xl border border-[#B91C1C] text-white shadow-[0_0_40px_rgba(211,47,47,0.3)] shrink-0 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative z-10">
                <h3 className="font-black text-xl mb-6 italic uppercase text-[#FFD700] underline decoration-black/30 underline-offset-4">Finalizar Pedido</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Nome completo</label>
                     <input 
                      required
                      type="text" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 placeholder-black/40 text-black font-bold transition-all shadow-sm"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Telefone / WhatsApp</label>
                     <input 
                      required
                      type="text" 
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 placeholder-black/40 text-black font-bold transition-all shadow-sm"
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Método de Entrega</label>
                      <select 
                        value={deliveryMethod}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 text-black font-bold appearance-none transition-all shadow-sm cursor-pointer"
                      >
                        <option value="Delivery">Delivery (Entregar no meu endereço)</option>
                        <option value="Retirar no local">Retirar no local</option>
                      </select>
                    </div>

                    {deliveryMethod === 'Delivery' && (
                      <>
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Rua e Número</label>
                          <input 
                            required={deliveryMethod === 'Delivery'}
                            type="text" 
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 placeholder-black/40 text-black font-bold transition-all shadow-sm"
                            placeholder="Ex: Rua Roberto Dalanana, 332"
                          />
                        </div>
                        
                        <div className="col-span-2">
                          <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Bairro</label>
                          <input 
                            required={deliveryMethod === 'Delivery'}
                            type="text" 
                            value={neighborhood}
                            onChange={(e) => setNeighborhood(e.target.value)}
                            className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 placeholder-black/40 text-black font-bold transition-all shadow-sm"
                            placeholder="Ex: Boqueirão"
                          />
                        </div>

                        <div className="col-span-2">
                          <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Ponto de Referência (Opcional)</label>
                          <input 
                            type="text" 
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 placeholder-black/40 text-black font-bold transition-all shadow-sm"
                            placeholder="Próximo a..."
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div>
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Forma de Pagamento</label>
                    <select 
                      value={payment}
                      onChange={(e) => setPayment(e.target.value)}
                      className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 text-black font-bold appearance-none transition-all shadow-sm cursor-pointer"
                    >
                      <option value="Pix">Pix (Desconto 5%)</option>
                      <option value="Cartão de Crédito - Maquininha">Cartão de Crédito - Maquininha</option>
                      <option value="Cartão de Débito - Maquininha">Cartão de Débito - Maquininha</option>
                      <option value="Dinheiro">Dinheiro</option>
                    </select>
                  </div>

                  {payment === 'Dinheiro' && (
                    <div className="mt-4 space-y-4 border border-black/10 rounded-xl p-4 bg-white/50">
                      <div>
                        <label className="block text-[10px] font-black uppercase tracking-widest text-black/80 mb-2">Precisa de troco?</label>
                        <div className="flex gap-6">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="needsChange" 
                              checked={needsChange === true}
                              onChange={() => setNeedsChange(true)}
                              className="text-[#DC2626] focus:ring-[#DC2626] w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-black/80">Sim</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                              type="radio" 
                              name="needsChange" 
                              checked={needsChange === false}
                              onChange={() => {
                                setNeedsChange(false);
                                setChangeFor('');
                              }}
                              className="text-[#DC2626] focus:ring-[#DC2626] w-4 h-4 cursor-pointer"
                            />
                            <span className="text-sm font-bold text-black/80">Não</span>
                          </label>
                        </div>
                      </div>

                      {needsChange && (
                        <div className="pt-2">
                          <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Para quanto?</label>
                          <input 
                            type="text" 
                            value={changeFor}
                            onChange={(e) => setChangeFor(e.target.value)}
                            className="w-full bg-white border border-black/10 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 placeholder-black/40 text-black font-bold transition-all shadow-sm"
                            placeholder="Ex: 50,00"
                            required={needsChange}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <div className="mt-4">
                    <label className="block text-[10px] font-black uppercase mb-1 tracking-widest text-black/80">Notas (Retirar grãos, itens do lanche, etc)</label>
                    <textarea 
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full bg-white/90 border-0 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-4 focus:ring-black/10 placeholder-black/40 text-black font-bold transition-all shadow-sm min-h-[80px]"
                      placeholder="Ex: Tirar milho e ervilha do dog..."
                    />
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-black/10">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-sm uppercase tracking-widest">Subtotal</span>
                    <span className="text-xl font-black">
                      R$ {total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-6 text-black/60">
                    <span className="font-bold text-[10px] uppercase tracking-widest">+ Taxa de Entrega</span>
                    <span className="font-bold text-[10px] uppercase tracking-widest text-right">A combinar</span>
                  </div>
                  
                  <button 
                    type="submit"
                    className="w-full bg-black text-white px-4 py-4 rounded-2xl font-black flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-transform uppercase tracking-widest text-sm shadow-xl shadow-black/20"
                  >
                    <Send size={20} />
                    Pedir no WhatsApp
                  </button>
                  <p className="text-[9px] text-center mt-4 text-black/60 font-bold uppercase tracking-widest">Pedido será formatado e enviado no WhatsApp</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
}

function ShoppingBagIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}
