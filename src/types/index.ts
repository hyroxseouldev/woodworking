/**
 * 조은나무 목재재단 서비스 - Type Definitions
 * Based on PRD data models
 */

// Lumber Category Types
export interface LumberCategory {
  id: string;
  name: string;
  type: 'panel' | 'lumber' | 'round';
  description: string;
  products: Product[];
}

// Product Types
export interface DiscountRate {
  minQuantity: number;
  maxQuantity: number;
  rate: number; // percentage
}

export interface Product {
  id: string;
  title: string;
  categoryId: string;
  thickness: number; // mm
  minWidth: number; // mm
  maxWidth: number; // mm
  minLength: number; // mm
  maxLength: number; // mm
  basePrice: number; // 원 per unit
  weight: number; // kg per unit
  lossRate: number; // percentage
  cutPrice: number; // 원 per cut
  discountRates: DiscountRate[];
  image: string;
  keywords: string[];
}

// Work Option Types
export interface WorkOption {
  id: string;
  title: string;
  basePrice: number; // 원
  additionalPrice: number; // 원 per unit
  description: string;
  image: string;
}

// Material Types
export interface Material {
  id: string;
  title: string;
  category: string;
  price: number; // 원
  discountPrice: number; // 원
  image: string;
  description: string;
}

export interface MaterialItem {
  id: string;
  quantity: number;
}

// Cart Types
export interface CartItem {
  id: string;
  productId: string;
  width: number; // mm
  length: number; // mm
  quantity: number;
  workOptions: string[]; // WorkOption IDs
  materials: MaterialItem[];
  customRequest: string;
  calculatedPrice: number; // 원
}

// Customer Types
export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  agreeToTerms: boolean;
}

// Order Types
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed';

export interface Order {
  id: string;
  customerInfo: CustomerInfo;
  items: CartItem[];
  totalPrice: number; // 원
  discountAmount: number; // 원
  finalPrice: number; // 원
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
}

// UI State Types
export interface SizeValidation {
  width: {
    min: number;
    max: number;
    isValid: boolean;
    message?: string;
  };
  length: {
    min: number;
    max: number;
    isValid: boolean;
    message?: string;
  };
}

// Step Navigation Types
export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface StepInfo {
  step: StepNumber;
  title: string;
  description: string;
  isCompleted: boolean;
  isActive: boolean;
}

// Price Calculation Types
export interface PriceBreakdown {
  basePrice: number;
  workOptionsPrice: number;
  materialsPrice: number;
  subtotal: number;
  discountAmount: number;
  finalPrice: number;
}

// Form Types
export interface SizeInputForm {
  width: number;
  length: number;
}

export interface CustomerForm extends CustomerInfo {
  // Additional form-specific fields can be added here
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Error Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface PriceCalculationError {
  code: string;
  message: string;
  details?: any;
}