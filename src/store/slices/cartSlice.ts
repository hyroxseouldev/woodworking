/**
 * Cart Slice - 장바구니 관리 및 실시간 가격 계산
 */

import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { CartItem, MaterialItem, PriceBreakdown, Product, WorkOption, Material, DiscountRate } from '@/types';
import { RootState } from '@/store';

interface CartState {
  items: CartItem[];
  currentItem: Partial<CartItem> | null; // Item being configured
  totalItems: number;
  totalPrice: number;
  discountAmount: number;
  finalPrice: number;
  loading: boolean;
  error: string | null;
}

const initialState: CartState = {
  items: [],
  currentItem: null,
  totalItems: 0,
  totalPrice: 0,
  discountAmount: 0,
  finalPrice: 0,
  loading: false,
  error: null,
};

// Helper function to calculate price for a single item
const calculateItemPrice = (
  item: CartItem,
  product: Product,
  workOptions: WorkOption[],
  materials: Material[]
): number => {
  if (!product) return 0;

  // Calculate area in square meters
  const area = (item.width * item.length) / 1000000; // Convert mm² to m²
  
  // Base price calculation
  let basePrice = product.basePrice * area * item.quantity;
  
  // Add loss rate
  basePrice *= (1 + product.lossRate / 100);
  
  // Work options price
  let workOptionsPrice = 0;
  item.workOptions.forEach(optionId => {
    const option = workOptions.find(wo => wo.id === optionId);
    if (option) {
      workOptionsPrice += option.basePrice + (option.additionalPrice * area);
    }
  });
  workOptionsPrice *= item.quantity;
  
  // Materials price
  let materialsPrice = 0;
  item.materials.forEach(materialItem => {
    const material = materials.find(m => m.id === materialItem.id);
    if (material) {
      materialsPrice += (material.discountPrice > 0 ? material.discountPrice : material.price) * materialItem.quantity;
    }
  });
  
  const subtotal = basePrice + workOptionsPrice + materialsPrice;
  
  // Apply quantity discounts
  let discount = 0;
  const applicableRate = product.discountRates.find(rate => 
    item.quantity >= rate.minQuantity && item.quantity <= rate.maxQuantity
  );
  if (applicableRate) {
    discount = subtotal * (applicableRate.rate / 100);
  }
  
  // Apply 100원 단위 할인 (round down to nearest 100)
  const finalPrice = Math.floor((subtotal - discount) / 100) * 100;
  
  return Math.max(finalPrice, 0);
};

// Helper function to generate unique ID
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    // Current item being configured
    setCurrentItem: (state, action: PayloadAction<Partial<CartItem>>) => {
      state.currentItem = action.payload;
    },
    updateCurrentItem: (state, action: PayloadAction<Partial<CartItem>>) => {
      if (state.currentItem) {
        state.currentItem = { ...state.currentItem, ...action.payload };
      }
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    
    // Cart management
    addToCart: (state, action: PayloadAction<Omit<CartItem, 'id' | 'calculatedPrice'>>) => {
      const newItem: CartItem = {
        ...action.payload,
        id: generateId(),
        calculatedPrice: 0, // Will be calculated by selector
      };
      state.items.push(newItem);
      state.currentItem = null; // Clear current item after adding
    },
    
    updateCartItem: (state, action: PayloadAction<{ id: string; updates: Partial<CartItem> }>) => {
      const { id, updates } = action.payload;
      const itemIndex = state.items.findIndex(item => item.id === id);
      if (itemIndex !== -1) {
        state.items[itemIndex] = { ...state.items[itemIndex], ...updates };
      }
    },
    
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.id !== action.payload);
    },
    
    updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      const item = state.items.find(item => item.id === id);
      if (item && quantity > 0) {
        item.quantity = quantity;
      } else if (item && quantity === 0) {
        state.items = state.items.filter(item => item.id !== id);
      }
    },
    
    clearCart: (state) => {
      state.items = [];
      state.currentItem = null;
      state.totalItems = 0;
      state.totalPrice = 0;
      state.discountAmount = 0;
      state.finalPrice = 0;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
});

// Selectors
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCurrentItem = (state: RootState) => state.cart.currentItem;
export const selectCartError = (state: RootState) => state.cart.error;

// Complex selector for calculating total cart price
export const selectCartTotals = createSelector(
  [selectCartItems, (state: RootState) => state.products.workOptions, (state: RootState) => state.products.materials, (state: RootState) => state.products.categories],
  (items, workOptions, materials, categories) => {
    let totalPrice = 0;
    let totalItems = 0;
    let totalDiscountAmount = 0;
    
    // Get all products from all categories
    const allProducts = categories.flatMap(cat => cat.products);
    
    items.forEach(item => {
      const product = allProducts.find(p => p.id === item.productId);
      if (product) {
        const itemPrice = calculateItemPrice(item, product, workOptions, materials);
        totalPrice += itemPrice;
        totalItems += item.quantity;
        
        // Calculate what the price would be without discount for comparison
        const area = (item.width * item.length) / 1000000;
        let basePrice = product.basePrice * area * item.quantity;
        basePrice *= (1 + product.lossRate / 100);
        
        let workOptionsPrice = 0;
        item.workOptions.forEach(optionId => {
          const option = workOptions.find(wo => wo.id === optionId);
          if (option) {
            workOptionsPrice += option.basePrice + (option.additionalPrice * area);
          }
        });
        workOptionsPrice *= item.quantity;
        
        let materialsPrice = 0;
        item.materials.forEach(materialItem => {
          const material = materials.find(m => m.id === materialItem.id);
          if (material) {
            materialsPrice += (material.discountPrice > 0 ? material.discountPrice : material.price) * materialItem.quantity;
          }
        });
        
        const subtotalWithoutDiscount = basePrice + workOptionsPrice + materialsPrice;
        const discountForThisItem = subtotalWithoutDiscount - itemPrice;
        totalDiscountAmount += discountForThisItem;
      }
    });
    
    // Apply 100원 단위 할인 to final total
    const finalPrice = Math.floor(totalPrice / 100) * 100;
    
    return {
      totalItems,
      totalPrice,
      discountAmount: totalDiscountAmount,
      finalPrice: Math.max(finalPrice, 0),
    };
  }
);

// Selector for calculating price of current item being configured
export const selectCurrentItemPrice = createSelector(
  [selectCurrentItem, (state: RootState) => state.products.selectedProduct, (state: RootState) => state.products.workOptions, (state: RootState) => state.products.materials],
  (currentItem, selectedProduct, workOptions, materials) => {
    if (!currentItem || !selectedProduct || !currentItem.width || !currentItem.length || !currentItem.quantity) {
      return {
        basePrice: 0,
        workOptionsPrice: 0,
        materialsPrice: 0,
        subtotal: 0,
        discountAmount: 0,
        finalPrice: 0,
      } as PriceBreakdown;
    }
    
    // Temporarily create a cart item for calculation
    const tempItem: CartItem = {
      id: 'temp',
      productId: selectedProduct.id,
      width: currentItem.width,
      length: currentItem.length,
      quantity: currentItem.quantity,
      workOptions: currentItem.workOptions || [],
      materials: currentItem.materials || [],
      customRequest: currentItem.customRequest || '',
      calculatedPrice: 0,
    };
    
    const area = (tempItem.width * tempItem.length) / 1000000;
    
    // Base price
    let basePrice = selectedProduct.basePrice * area * tempItem.quantity;
    basePrice *= (1 + selectedProduct.lossRate / 100);
    
    // Work options price
    let workOptionsPrice = 0;
    tempItem.workOptions.forEach(optionId => {
      const option = workOptions.find(wo => wo.id === optionId);
      if (option) {
        workOptionsPrice += option.basePrice + (option.additionalPrice * area);
      }
    });
    workOptionsPrice *= tempItem.quantity;
    
    // Materials price
    let materialsPrice = 0;
    tempItem.materials.forEach(materialItem => {
      const material = materials.find(m => m.id === materialItem.id);
      if (material) {
        materialsPrice += (material.discountPrice > 0 ? material.discountPrice : material.price) * materialItem.quantity;
      }
    });
    
    const subtotal = basePrice + workOptionsPrice + materialsPrice;
    
    // Apply quantity discounts
    let discountAmount = 0;
    const applicableRate = selectedProduct.discountRates.find(rate => 
      tempItem.quantity >= rate.minQuantity && tempItem.quantity <= rate.maxQuantity
    );
    if (applicableRate) {
      discountAmount = subtotal * (applicableRate.rate / 100);
    }
    
    // Apply 100원 단위 할인
    const finalPrice = Math.floor((subtotal - discountAmount) / 100) * 100;
    
    return {
      basePrice,
      workOptionsPrice,
      materialsPrice,
      subtotal,
      discountAmount,
      finalPrice: Math.max(finalPrice, 0),
    } as PriceBreakdown;
  }
);

export const { 
  setCurrentItem, 
  updateCurrentItem, 
  clearCurrentItem,
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  updateQuantity, 
  clearCart,
  setError,
  clearError
} = cartSlice.actions;

export default cartSlice.reducer;