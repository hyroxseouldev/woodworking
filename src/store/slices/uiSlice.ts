/**
 * UI Slice - 단계 네비게이션, 유효성 검증, UI 상태 관리
 */

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { StepNumber, StepInfo, SizeValidation, ValidationError } from "@/types";

interface UiState {
  currentStep: StepNumber;
  steps: StepInfo[];
  sizeValidation: SizeValidation;
  validationErrors: ValidationError[];
  isLoading: boolean;
  showMobileMenu: boolean;
  showPriceBreakdown: boolean;
  showConsultationModal: boolean;
  notifications: {
    id: string;
    type: "success" | "error" | "warning" | "info";
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
  }[];
}

const initialSteps: StepInfo[] = [
  {
    step: 1,
    title: "목재 종류 선택",
    description: "판재, 각재, 원형봉 중 선택",
    isCompleted: false,
    isActive: true,
  },
  {
    step: 2,
    title: "사이즈 및 가공 선택",
    description: "폭, 길이 입력 및 가공 옵션 선택",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 3,
    title: "부자재 선택",
    description: "필요한 부자재 추가 선택",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 4,
    title: "주문서 확인",
    description: "선택한 모든 항목과 총 가격 확인",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 5,
    title: "개인정보 입력",
    description: "고객 정보 입력 및 주문서 전송",
    isCompleted: false,
    isActive: false,
  },
  {
    step: 6,
    title: "결제 안내",
    description: "결제 방법 안내 및 외부 결제 페이지 연결",
    isCompleted: false,
    isActive: false,
  },
];

const initialState: UiState = {
  currentStep: 1,
  steps: initialSteps,
  sizeValidation: {
    width: {
      min: 0,
      max: 0,
      isValid: false,
      message: undefined,
    },
    length: {
      min: 0,
      max: 0,
      isValid: false,
      message: undefined,
    },
  },
  validationErrors: [],
  isLoading: false,
  showMobileMenu: false,
  showPriceBreakdown: false,
  showConsultationModal: false,
  notifications: [],
};

// Helper function to generate notification ID
const generateNotificationId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    // Step Navigation
    setCurrentStep: (state, action: PayloadAction<StepNumber>) => {
      const newStep = action.payload;
      state.currentStep = newStep;

      // Update step states
      state.steps = state.steps.map((step, index) => ({
        ...step,
        isActive: step.step === newStep,
        isCompleted: step.step < newStep,
      }));
    },

    nextStep: (state) => {
      if (state.currentStep < 6) {
        const newStep = (state.currentStep + 1) as StepNumber;
        state.currentStep = newStep;

        // Mark previous step as completed
        const prevStepIndex = state.currentStep - 2;
        if (prevStepIndex >= 0) {
          state.steps[prevStepIndex].isCompleted = true;
        }

        // Update step states
        state.steps = state.steps.map((step, index) => ({
          ...step,
          isActive: step.step === newStep,
          isCompleted: step.step < newStep,
        }));
      }
    },

    previousStep: (state) => {
      if (state.currentStep > 1) {
        const newStep = (state.currentStep - 1) as StepNumber;
        state.currentStep = newStep;

        // Update step states
        state.steps = state.steps.map((step, index) => ({
          ...step,
          isActive: step.step === newStep,
          isCompleted: step.step < newStep,
        }));
      }
    },

    completeStep: (state, action: PayloadAction<StepNumber>) => {
      const stepIndex = action.payload - 1;
      if (stepIndex >= 0 && stepIndex < state.steps.length) {
        state.steps[stepIndex].isCompleted = true;
      }
    },

    resetSteps: (state) => {
      state.currentStep = 1;
      state.steps = initialSteps;
    },

    // Size Validation
    setSizeValidation: (state, action: PayloadAction<SizeValidation>) => {
      state.sizeValidation = action.payload;
    },

    updateSizeValidation: (
      state,
      action: PayloadAction<Partial<SizeValidation>>
    ) => {
      state.sizeValidation = { ...state.sizeValidation, ...action.payload };
    },

    validateSize: (
      state,
      action: PayloadAction<{
        width: number;
        length: number;
        minWidth: number;
        maxWidth: number;
        minLength: number;
        maxLength: number;
      }>
    ) => {
      const { width, length, minWidth, maxWidth, minLength, maxLength } =
        action.payload;

      // Validate width
      const widthValid = width >= minWidth && width <= maxWidth;
      let widthMessage: string | undefined;
      if (!widthValid) {
        if (width < minWidth) {
          widthMessage = `최소 폭은 ${minWidth}mm 입니다.`;
        } else if (width > maxWidth) {
          widthMessage = `최대 폭은 ${maxWidth}mm 입니다.`;
        }
      }

      // Validate length
      const lengthValid = length >= minLength && length <= maxLength;
      let lengthMessage: string | undefined;
      if (!lengthValid) {
        if (length < minLength) {
          lengthMessage = `최소 길이는 ${minLength}mm 입니다.`;
        } else if (length > maxLength) {
          lengthMessage = `최대 길이는 ${maxLength}mm 입니다.`;
        }
      }

      state.sizeValidation = {
        width: {
          min: minWidth,
          max: maxWidth,
          isValid: widthValid,
          message: widthMessage,
        },
        length: {
          min: minLength,
          max: maxLength,
          isValid: lengthValid,
          message: lengthMessage,
        },
      };
    },

    // Validation Errors
    addValidationError: (state, action: PayloadAction<ValidationError>) => {
      // Remove existing error for the same field
      state.validationErrors = state.validationErrors.filter(
        (error) => error.field !== action.payload.field
      );
      // Add new error
      state.validationErrors.push(action.payload);
    },

    removeValidationError: (state, action: PayloadAction<string>) => {
      state.validationErrors = state.validationErrors.filter(
        (error) => error.field !== action.payload
      );
    },

    clearValidationErrors: (state) => {
      state.validationErrors = [];
    },

    // UI State
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },

    toggleMobileMenu: (state) => {
      state.showMobileMenu = !state.showMobileMenu;
    },

    setMobileMenu: (state, action: PayloadAction<boolean>) => {
      state.showMobileMenu = action.payload;
    },

    togglePriceBreakdown: (state) => {
      state.showPriceBreakdown = !state.showPriceBreakdown;
    },

    setPriceBreakdown: (state, action: PayloadAction<boolean>) => {
      state.showPriceBreakdown = action.payload;
    },

    toggleConsultationModal: (state) => {
      state.showConsultationModal = !state.showConsultationModal;
    },

    setConsultationModal: (state, action: PayloadAction<boolean>) => {
      state.showConsultationModal = action.payload;
    },

    // Notifications
    addNotification: (
      state,
      action: PayloadAction<{
        type: "success" | "error" | "warning" | "info";
        title: string;
        message: string;
      }>
    ) => {
      const notification = {
        id: generateNotificationId(),
        ...action.payload,
        timestamp: new Date().toISOString(),
        isRead: false,
      };
      state.notifications.unshift(notification); // Add to beginning

      // Keep only the latest 10 notifications
      if (state.notifications.length > 10) {
        state.notifications = state.notifications.slice(0, 10);
      }
    },

    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        (n) => n.id === action.payload
      );
      if (notification) {
        notification.isRead = true;
      }
    },

    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },

    clearNotifications: (state) => {
      state.notifications = [];
    },

    // Reset UI state
    resetUi: (state) => {
      return { ...initialState };
    },
  },
});

export const {
  setCurrentStep,
  nextStep,
  previousStep,
  completeStep,
  resetSteps,
  setSizeValidation,
  updateSizeValidation,
  validateSize,
  addValidationError,
  removeValidationError,
  clearValidationErrors,
  setLoading,
  toggleMobileMenu,
  setMobileMenu,
  togglePriceBreakdown,
  setPriceBreakdown,
  toggleConsultationModal,
  setConsultationModal,
  addNotification,
  markNotificationAsRead,
  removeNotification,
  clearNotifications,
  resetUi,
} = uiSlice.actions;

export default uiSlice.reducer;
