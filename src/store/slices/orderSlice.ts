/**
 * Order Slice - 주문 및 고객 정보 관리
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Order, CustomerInfo, CartItem, OrderStatus, ApiResponse } from '@/types';

interface OrderState {
  currentOrder: Order | null;
  customerInfo: CustomerInfo | null;
  orderHistory: Order[];
  loading: boolean;
  error: string | null;
  submitSuccess: boolean;
}

const initialState: OrderState = {
  currentOrder: null,
  customerInfo: null,
  orderHistory: [],
  loading: false,
  error: null,
  submitSuccess: false,
};

// Helper function to generate order ID
const generateOrderId = (): string => {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substr(2, 5);
  return `ORD-${timestamp}-${random}`.toUpperCase();
};

// Async thunks for API calls
export const submitOrder = createAsyncThunk(
  'order/submitOrder',
  async (orderData: { customerInfo: CustomerInfo; items: CartItem[]; totalPrice: number; discountAmount: number; finalPrice: number }) => {
    // Simulate API call to submit order
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const order: Order = {
      id: generateOrderId(),
      customerInfo: orderData.customerInfo,
      items: orderData.items,
      totalPrice: orderData.totalPrice,
      discountAmount: orderData.discountAmount,
      finalPrice: orderData.finalPrice,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Simulate email sending
    console.log('주문서 이메일 발송:', {
      to: orderData.customerInfo.email,
      orderId: order.id,
      finalPrice: order.finalPrice,
    });
    
    return order;
  }
);

export const updateOrderStatus = createAsyncThunk(
  'order/updateOrderStatus',
  async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { orderId, status };
  }
);

export const fetchOrderHistory = createAsyncThunk(
  'order/fetchOrderHistory',
  async (customerEmail: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock order history
    const mockHistory: Order[] = [
      {
        id: 'ORD-1234567890-ABCDE',
        customerInfo: {
          name: '홍길동',
          email: customerEmail,
          phone: '010-1234-5678',
          company: 'DIY 공방',
          agreeToTerms: true,
        },
        items: [],
        totalPrice: 45000,
        discountAmount: 5000,
        finalPrice: 40000,
        status: 'completed',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      }
    ];
    
    return mockHistory;
  }
);

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    // Customer Info Management
    setCustomerInfo: (state, action: PayloadAction<CustomerInfo>) => {
      state.customerInfo = action.payload;
    },
    updateCustomerInfo: (state, action: PayloadAction<Partial<CustomerInfo>>) => {
      if (state.customerInfo) {
        state.customerInfo = { ...state.customerInfo, ...action.payload };
      } else {
        state.customerInfo = action.payload as CustomerInfo;
      }
    },
    clearCustomerInfo: (state) => {
      state.customerInfo = null;
    },
    
    // Order Management
    createOrder: (state, action: PayloadAction<{ items: CartItem[]; totalPrice: number; discountAmount: number; finalPrice: number }>) => {
      if (state.customerInfo) {
        const newOrder: Order = {
          id: generateOrderId(),
          customerInfo: state.customerInfo,
          items: action.payload.items,
          totalPrice: action.payload.totalPrice,
          discountAmount: action.payload.discountAmount,
          finalPrice: action.payload.finalPrice,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        state.currentOrder = newOrder;
      }
    },
    
    updateCurrentOrder: (state, action: PayloadAction<Partial<Order>>) => {
      if (state.currentOrder) {
        state.currentOrder = { ...state.currentOrder, ...action.payload, updatedAt: new Date() };
      }
    },
    
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    
    // Reset submit success flag
    resetSubmitSuccess: (state) => {
      state.submitSuccess = false;
    },
    
    // Error Management
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    
    // Reset entire order state
    resetOrder: (state) => {
      state.currentOrder = null;
      state.customerInfo = null;
      state.loading = false;
      state.error = null;
      state.submitSuccess = false;
    },
  },
  extraReducers: (builder) => {
    // Submit Order
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.submitSuccess = false;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload;
        state.orderHistory.unshift(action.payload); // Add to beginning of history
        state.submitSuccess = true;
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '주문 제출에 실패했습니다.';
        state.submitSuccess = false;
      });
    
    // Update Order Status
    builder
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const { orderId, status } = action.payload;
        
        // Update current order if it matches
        if (state.currentOrder && state.currentOrder.id === orderId) {
          state.currentOrder.status = status;
          state.currentOrder.updatedAt = new Date();
        }
        
        // Update in order history
        const historyIndex = state.orderHistory.findIndex(order => order.id === orderId);
        if (historyIndex !== -1) {
          state.orderHistory[historyIndex].status = status;
          state.orderHistory[historyIndex].updatedAt = new Date();
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.error.message || '주문 상태 업데이트에 실패했습니다.';
      });
    
    // Fetch Order History
    builder
      .addCase(fetchOrderHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.orderHistory = action.payload;
      })
      .addCase(fetchOrderHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '주문 내역을 불러오는데 실패했습니다.';
      });
  },
});

export const {
  setCustomerInfo,
  updateCustomerInfo,
  clearCustomerInfo,
  createOrder,
  updateCurrentOrder,
  clearCurrentOrder,
  resetSubmitSuccess,
  setError,
  clearError,
  resetOrder,
} = orderSlice.actions;

export default orderSlice.reducer;