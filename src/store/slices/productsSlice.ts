/**
 * Products Slice - 목재 제품, 카테고리, 가공 옵션 관리
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LumberCategory, Product, WorkOption, Material } from '@/types';

interface ProductsState {
  categories: LumberCategory[];
  selectedCategory: string | null;
  selectedProduct: Product | null;
  workOptions: WorkOption[];
  materials: Material[];
  loading: boolean;
  error: string | null;
}

const initialState: ProductsState = {
  categories: [],
  selectedCategory: null,
  selectedProduct: null,
  workOptions: [],
  materials: [],
  loading: false,
  error: null,
};

// Mock data for development - will be replaced with API calls
const mockCategories: LumberCategory[] = [
  {
    id: 'panel',
    name: '판재',
    type: 'panel',
    description: '평평한 판 형태의 목재',
    products: [
      {
        id: 'pine-panel',
        title: '소나무 집성목',
        categoryId: 'panel',
        thickness: 18,
        minWidth: 100,
        maxWidth: 1200,
        minLength: 300,
        maxLength: 2400,
        basePrice: 12000,
        weight: 0.65,
        lossRate: 5,
        cutPrice: 500,
        discountRates: [
          { minQuantity: 1, maxQuantity: 2, rate: 0 },
          { minQuantity: 3, maxQuantity: 5, rate: 5 },
          { minQuantity: 6, maxQuantity: 10, rate: 8 },
          { minQuantity: 11, maxQuantity: 999, rate: 12 }
        ],
        image: '/images/pine-panel.jpg',
        keywords: ['소나무', '집성목', '판재']
      }
    ]
  },
  {
    id: 'lumber',
    name: '각재',
    type: 'lumber',
    description: '각진 형태의 목재',
    products: [
      {
        id: 'pine-lumber',
        title: '소나무 각재',
        categoryId: 'lumber',
        thickness: 38,
        minWidth: 38,
        maxWidth: 89,
        minLength: 300,
        maxLength: 3000,
        basePrice: 8000,
        weight: 0.5,
        lossRate: 3,
        cutPrice: 300,
        discountRates: [
          { minQuantity: 1, maxQuantity: 3, rate: 0 },
          { minQuantity: 4, maxQuantity: 7, rate: 5 },
          { minQuantity: 8, maxQuantity: 15, rate: 8 },
          { minQuantity: 16, maxQuantity: 999, rate: 12 }
        ],
        image: '/images/pine-lumber.jpg',
        keywords: ['소나무', '각재']
      }
    ]
  },
  {
    id: 'round',
    name: '원형봉',
    type: 'round',
    description: '원형 봉 형태의 목재',
    products: [
      {
        id: 'pine-round',
        title: '소나무 원형봉',
        categoryId: 'round',
        thickness: 20,
        minWidth: 10,
        maxWidth: 50,
        minLength: 300,
        maxLength: 2000,
        basePrice: 5000,
        weight: 0.3,
        lossRate: 2,
        cutPrice: 200,
        discountRates: [
          { minQuantity: 1, maxQuantity: 5, rate: 0 },
          { minQuantity: 6, maxQuantity: 10, rate: 5 },
          { minQuantity: 11, maxQuantity: 20, rate: 8 },
          { minQuantity: 21, maxQuantity: 999, rate: 12 }
        ],
        image: '/images/pine-round.jpg',
        keywords: ['소나무', '원형봉']
      }
    ]
  }
];

const mockWorkOptions: WorkOption[] = [
  { id: 'cutting', title: '재단', basePrice: 0, additionalPrice: 500, description: '정확한 사이즈로 재단', image: '/images/work-cutting.jpg' },
  { id: 'planing', title: '대패질', basePrice: 1000, additionalPrice: 800, description: '표면을 매끄럽게', image: '/images/work-planing.jpg' },
  { id: 'drilling', title: '구멍가공', basePrice: 500, additionalPrice: 300, description: '원하는 위치에 구멍', image: '/images/work-drilling.jpg' },
  { id: 'sanding', title: '샌딩', basePrice: 800, additionalPrice: 600, description: '표면 연마', image: '/images/work-sanding.jpg' },
];

const mockMaterials: Material[] = [
  { id: 'screws-wood', title: '목재용 나사 (3x25mm)', category: '나사', price: 100, discountPrice: 80, image: '/images/screws-wood.jpg', description: '목재 결합용 나사' },
  { id: 'wood-glue', title: '목공용 본드', category: '접착제', price: 3000, discountPrice: 2500, image: '/images/wood-glue.jpg', description: '강력한 목재 접착제' },
  { id: 'hinges', title: '경첩 (50mm)', category: '철물', price: 2000, discountPrice: 1800, image: '/images/hinges.jpg', description: '문짝용 경첩' },
];

// Async thunks for API calls (mock implementation)
export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    return mockCategories;
  }
);

export const fetchWorkOptions = createAsyncThunk(
  'products/fetchWorkOptions',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockWorkOptions;
  }
);

export const fetchMaterials = createAsyncThunk(
  'products/fetchMaterials',
  async () => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMaterials;
  }
);

const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    selectCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
      state.selectedProduct = null; // Reset product selection when category changes
    },
    selectProduct: (state, action: PayloadAction<Product>) => {
      state.selectedProduct = action.payload;
    },
    clearSelection: (state) => {
      state.selectedCategory = null;
      state.selectedProduct = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '카테고리를 불러오는데 실패했습니다.';
      });

    // Work Options
    builder
      .addCase(fetchWorkOptions.fulfilled, (state, action) => {
        state.workOptions = action.payload;
      })
      .addCase(fetchWorkOptions.rejected, (state, action) => {
        state.error = action.error.message || '가공 옵션을 불러오는데 실패했습니다.';
      });

    // Materials
    builder
      .addCase(fetchMaterials.fulfilled, (state, action) => {
        state.materials = action.payload;
      })
      .addCase(fetchMaterials.rejected, (state, action) => {
        state.error = action.error.message || '부자재를 불러오는데 실패했습니다.';
      });
  },
});

export const { selectCategory, selectProduct, clearSelection, clearError } = productsSlice.actions;
export default productsSlice.reducer;