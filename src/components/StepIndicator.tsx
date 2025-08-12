'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { setCurrentStep } from '@/store/slices/uiSlice';
import { StepNumber } from '@/types';
import { cn } from '@/lib/utils';

interface StepIndicatorProps {
  className?: string;
}

export function StepIndicator({ className }: StepIndicatorProps) {
  const dispatch = useAppDispatch();
  const { currentStep, steps } = useAppSelector((state) => state.ui);

  const handleStepClick = (stepNumber: StepNumber) => {
    // Only allow navigation to completed steps or the current step
    const step = steps.find(s => s.step === stepNumber);
    if (step && (step.isCompleted || step.isActive)) {
      dispatch(setCurrentStep(stepNumber));
    }
  };

  return (
    <div className={cn("w-full bg-white border-b border-gray-200", className)}>
      {/* Mobile View - Compact horizontal steps */}
      <div className="block md:hidden px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1">
              {steps.map((step, index) => (
                <React.Fragment key={step.step}>
                  <motion.button
                    onClick={() => handleStepClick(step.step)}
                    disabled={!step.isCompleted && !step.isActive}
                    className={cn(
                      "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                      step.isActive
                        ? "bg-primary text-primary-foreground"
                        : step.isCompleted
                        ? "bg-green-500 text-white cursor-pointer hover:bg-green-600"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    )}
                    whileHover={step.isCompleted || step.isActive ? { scale: 1.05 } : {}}
                    whileTap={step.isCompleted || step.isActive ? { scale: 0.95 } : {}}
                  >
                    {step.isCompleted ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      step.step
                    )}
                  </motion.button>
                  {index < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-300" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {currentStep}/6
          </div>
        </div>
        <div className="mt-2">
          <h3 className="text-sm font-medium text-gray-900">
            {steps[currentStep - 1]?.title}
          </h3>
          <p className="text-xs text-gray-500 mt-1">
            {steps[currentStep - 1]?.description}
          </p>
        </div>
      </div>

      {/* Desktop View - Full horizontal stepper */}
      <div className="hidden md:block px-8 py-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          {steps.map((step, index) => (
            <React.Fragment key={step.step}>
              <div className="flex flex-col items-center">
                <motion.button
                  onClick={() => handleStepClick(step.step)}
                  disabled={!step.isCompleted && !step.isActive}
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium transition-all duration-200",
                    step.isActive
                      ? "bg-primary text-primary-foreground shadow-lg ring-4 ring-primary/20"
                      : step.isCompleted
                      ? "bg-green-500 text-white cursor-pointer hover:bg-green-600 hover:shadow-md"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"
                  )}
                  whileHover={step.isCompleted || step.isActive ? { scale: 1.1 } : {}}
                  whileTap={step.isCompleted || step.isActive ? { scale: 0.95 } : {}}
                  initial={false}
                  animate={step.isActive ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  {step.isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.step
                  )}
                </motion.button>
                
                <div className="mt-3 text-center min-w-0 flex-1">
                  <h3 className={cn(
                    "text-sm font-medium",
                    step.isActive
                      ? "text-primary"
                      : step.isCompleted
                      ? "text-green-600"
                      : "text-gray-500"
                  )}>
                    {step.title}
                  </h3>
                  <p className={cn(
                    "text-xs mt-1 max-w-24 mx-auto leading-tight",
                    step.isActive
                      ? "text-primary/80"
                      : step.isCompleted
                      ? "text-green-500"
                      : "text-gray-400"
                  )}>
                    {step.description}
                  </p>
                </div>
              </div>
              
              {index < steps.length - 1 && (
                <div className="flex-1 px-4">
                  <motion.div
                    className={cn(
                      "h-0.5 rounded-full transition-all duration-300",
                      step.isCompleted
                        ? "bg-green-500"
                        : "bg-gray-200"
                    )}
                    initial={{ scaleX: 0 }}
                    animate={{ 
                      scaleX: step.isCompleted ? 1 : 0,
                      backgroundColor: step.isCompleted ? "#10b981" : "#e5e7eb"
                    }}
                    transition={{ duration: 0.5, delay: step.isCompleted ? 0.2 : 0 }}
                    style={{ transformOrigin: "left" }}
                  />
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="w-full bg-gray-100 h-1">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${(currentStep / 6) * 100}%` }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      </div>
    </div>
  );
}