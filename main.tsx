import { useState, useEffect } from 'react';
import { Product, Category, StoreSettings } from './types';
import { collection, onSnapshot, doc, setDoc, deleteDoc, writeBatch, getDocs } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1', name: 'Xis Gaúcho' },
  { id: 'c2', name: 'Cachorro Quente' },
  { id: 'c3', name: 'Bebidas' },
];

const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', categoryId: 'c1', name: 'X-KIDS', price: 16.00, description: 'Pão, carne, queijo.', imageUrl: '/xiskids.jpeg' },
  { id: 'p2', categoryId: 'c1', name: 'X-SALADA', price: 20.00, description: 'Pão, carne, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/xissalada.jpeg' },
  { id: 'p3', categoryId: 'c1', name: 'X-DUPLO', price: 28.00, description: 'Pão, 2 carnes, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/xisduplo.jpeg' },
  { id: 'p4', categoryId: 'c1', name: 'X-CORAÇÃO', price: 26.00, description: 'Pão, carne, coração, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/xiscoracao.jpeg' },
  { id: 'p5', categoryId: 'c1', name: 'X-CALABRESA', price: 26.00, description: 'Pão, carne, calabresa, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/xiscalabresa.jpeg' },
  { id: 'p6', categoryId: 'c1', name: 'X-BACON', price: 30.00, description: 'Pão, carne, bacon, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/xisbacon.jpeg' },
  { id: 'p7', categoryId: 'c1', name: 'X-CHEDDAR E BACON', price: 33.00, description: 'Pão, carne, cheddar, bacon, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/cachorrobaconchedar.jpeg' },
  { id: 'p8', categoryId: 'c1', name: 'X-DUPLO BACON', price: 35.00, description: 'Pão, 2 carnes, bacon, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/xisduplobacon.jpeg' },
  { id: 'p9', categoryId: 'c1', name: 'X-TUDÃO', price: 35.00, description: 'Pão, carne, bacon, calabresa, coração, ovo, queijo, tomate, alface, milho, ervilha, maionese e ketchup.', imageUrl: '/xistudao.jpeg' },
  
  { id: 'p10', categoryId: 'c2', name: 'DOG - TRADICIONAL', price: 18.00, description: 'Pão, salsicha, molho, milho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/cachorrotradicional.jpeg' },
  { id: 'p11', categoryId: 'c2', name: 'DOG - DUPLO', price: 23.00, description: 'Pão, 2 salsichas, molho, milho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/cachorroduplo.jpeg' },
  { id: 'p12', categoryId: 'c2', name: 'DOG - CORAÇÃO', price: 24.00, description: 'Pão, salsicha, coração, molho, milho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/cachorrocoracao.jpeg' },
  { id: 'p13', categoryId: 'c2', name: 'DOG - CALABRESA', price: 24.00, description: 'Pão, salsicha, calabresa, molho, milho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/cachorrocalabresa.jpeg' },
  { id: 'p14', categoryId: 'c2', name: 'DOG - BACON', price: 28.00, description: 'Pão, salsicha, bacon, molho, milho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/cachorrobacon.jpeg' },
  { id: 'p15', categoryId: 'c2', name: 'DOG - STROGONOFF', price: 28.00, description: 'Pão, salsicha, strogonoff, molho, milho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/cachorroestrogonof.jpeg' },
  { id: 'p16', categoryId: 'c2', name: 'DOG - CHEDDAR E BACON', price: 30.00, description: 'Pão, salsicha, cheddar, bacon, molho, milho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/cachorrochedarbacon.jpeg' },
  { id: 'p17', categoryId: 'c2', name: 'DOG - TUDÃO', price: 33.00, description: 'Pão, salsicha, bacon, calabresa, milho, molho, ervilha, maionese, ketchup e batata palha.', imageUrl: '/dogtudao.jpeg' },
  
  { id: 'p18', categoryId: 'c3', name: 'Refrigerante', price: 6.00, description: 'Selecione o sabor no chat e verifique a disponibilidade.', imageUrl: '/refri.png' },
  { id: 'p19', categoryId: 'c3', name: 'Água', price: 5.00, description: 'Selecione com ou sem gás no chat e verifique a disponibilidade.', imageUrl: '/agua.jpg' },
];

const INITIAL_SETTINGS: StoreSettings = {
  whatsappNumber: '555493006238'
};

export function useStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<StoreSettings>(INITIAL_SETTINGS);

  useEffect(() => {
    const seedInitialData = async () => {
      try {
        await setDoc(doc(db, 'settings', 'main'), { whatsappNumber: '555493006238' }, { merge: true });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, 'settings/main');
      }
      const isSeeded = localStorage.getItem('pointdog_seeded_v4');
      if (!isSeeded) {
        try {
          // Clear existing collections
          const catDocs = await getDocs(collection(db, 'categories'));
          const prodDocs = await getDocs(collection(db, 'products'));
          
          let deleteBatch = writeBatch(db);
          let deleteCount = 0;
          
          catDocs.forEach(d => {
            deleteBatch.delete(d.ref);
            deleteCount++;
          });
          prodDocs.forEach(d => {
            deleteBatch.delete(d.ref);
            deleteCount++;
          });
          
          if (deleteCount > 0) {
            await deleteBatch.commit();
          }

          // Seed new data
          const batch = writeBatch(db);
          INITIAL_CATEGORIES.forEach(cat => {
            batch.set(doc(collection(db, 'categories'), cat.id), cat);
          });
          INITIAL_PRODUCTS.forEach(prod => {
            batch.set(doc(collection(db, 'products'), prod.id), prod);
          });
          batch.set(doc(db, 'settings', 'main'), INITIAL_SETTINGS);
          await batch.commit();
          localStorage.setItem('pointdog_seeded_v4', 'true');
        } catch (error) {
          handleFirestoreError(error, OperationType.WRITE, 'batch/seed');
        }
      }
    };
    seedInitialData();

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const fetchedProducts: Product[] = [];
      snapshot.forEach(doc => {
        fetchedProducts.push({ id: doc.id, ...doc.data() } as Product);
      });
      if (snapshot.empty) {
        setProducts(INITIAL_PRODUCTS);
      } else {
        setProducts(fetchedProducts);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const fetchedCategories: Category[] = [];
      snapshot.forEach(doc => {
        fetchedCategories.push({ id: doc.id, ...doc.data() } as Category);
      });
      if (snapshot.empty) {
        setCategories(INITIAL_CATEGORIES);
      } else {
        // Sort categories to maintain some order, e.g., by ID
        setCategories(fetchedCategories.sort((a, b) => a.id.localeCompare(b.id)));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'categories');
    });

    const unsubSettings = onSnapshot(doc(db, 'settings', 'main'), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as StoreSettings);
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'settings/main');
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubSettings();
    };
  }, []);

  const addProduct = async (product: Product) => {
    try {
      if (!product.id) {
        product.id = doc(collection(db, 'products')).id;
      }
      await setDoc(doc(db, 'products', product.id), product);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `products/${product.id}`);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `products/${updatedProduct.id}`);
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${id}`);
    }
  };

  const updateSettings = async (newSettings: StoreSettings) => {
    try {
      await setDoc(doc(db, 'settings', 'main'), newSettings);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/main');
    }
  };

  return {
    products,
    categories,
    settings,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSettings
  };
}
