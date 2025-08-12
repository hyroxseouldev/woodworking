'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Ruler, AlertCircle, CheckCircle, Info, Calculator, ArrowRight } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { validateSize } from '@/store/slices/uiSlice';
import { updateCurrentItem } from '@/store/slices/cartSlice';
import { nextStep } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

interface SizeInputProps {
  className?: string;
}

export function SizeInput({ className }: SizeInputProps) {
  const dispatch = useAppDispatch();
  const { selectedProduct } = useAppSelector((state) => state.products);
  const { sizeValidation } = useAppSelector((state) => state.ui);
  const { currentItem } = useAppSelector((state) => state.cart);
  
  const [width, setWidth] = useState(currentItem?.width?.toString() || '');
  const [length, setLength] = useState(currentItem?.length?.toString() || '');
  const [quantity, setQuantity] = useState(currentItem?.quantity?.toString() || '1');

  // Calculate area and preview info
  const widthNum = parseFloat(width) || 0;
  const lengthNum = parseFloat(length) || 0;
  const quantityNum = parseInt(quantity) || 0;
  const area = widthNum && lengthNum ? (widthNum * lengthNum) / 1000000 : 0; // m²
  const totalArea = area * quantityNum;

  useEffect(() => {
    if (selectedProduct && widthNum > 0 && lengthNum > 0) {
      dispatch(validateSize({
        width: widthNum,
        length: lengthNum,
        minWidth: selectedProduct.minWidth,
        maxWidth: selectedProduct.maxWidth,
        minLength: selectedProduct.minLength,
        maxLength: selectedProduct.maxLength,
      }));
    }
  }, [dispatch, selectedProduct, widthNum, lengthNum]);

  useEffect(() => {
    // Update current item in cart state
    if (widthNum > 0 && lengthNum > 0 && quantityNum > 0) {
      dispatch(updateCurrentItem({
        productId: selectedProduct?.id,
        width: widthNum,
        length: lengthNum,
        quantity: quantityNum,
        workOptions: currentItem?.workOptions || [],
        materials: currentItem?.materials || [],
        customRequest: currentItem?.customRequest || '',
      }));
    }
  }, [dispatch, widthNum, lengthNum, quantityNum, selectedProduct?.id, currentItem?.workOptions, currentItem?.materials, currentItem?.customRequest]);

  const handleWidthChange = (value: string) => {
    // Allow only numbers and decimal point
    if (/^\d*\.?\d*$/.test(value)) {
      setWidth(value);
    }
  };

  const handleLengthChange = (value: string) => {
    if (/^\d*\.?\d*$/.test(value)) {
      setLength(value);
    }
  };

  const handleQuantityChange = (value: string) => {
    if (/^\d*$/.test(value) && parseInt(value) >= 0) {
      setQuantity(value);
    }
  };

  const handleNext = () => {
    if (canProceed) {
      dispatch(nextStep());
    }
  };

  if (!selectedProduct) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-gray-600">먼저 목재를 선택해주세요.</p>
      </div>
    );
  }

  const isWidthValid = sizeValidation.width.isValid;
  const isLengthValid = sizeValidation.length.isValid;
  const isQuantityValid = quantityNum > 0;
  const canProceed = isWidthValid && isLengthValid && isQuantityValid;

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">사이즈를 입력하세요</h2>
        <p className="text-gray-600">선택한 목재의 정확한 크기와 수량을 입력해주세요.</p>
      </div>

      {/* Selected Product Info */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center text-lg">
            <Ruler className="w-5 h-5 mr-2 text-primary" />
            선택된 목재: {selectedProduct.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">두께:</span>
              <div className="font-semibold">{selectedProduct.thickness}mm</div>
            </div>
            <div>
              <span className="text-gray-600">폭 범위:</span>
              <div className="font-semibold">{selectedProduct.minWidth}~{selectedProduct.maxWidth}mm</div>
            </div>
            <div>
              <span className="text-gray-600">길이 범위:</span>
              <div className="font-semibold">{selectedProduct.minLength}~{selectedProduct.maxLength}mm</div>
            </div>
            <div>
              <span className="text-gray-600">기본 가격:</span>
              <div className="font-semibold text-primary">{selectedProduct.basePrice.toLocaleString()}원/m²</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Size Input */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">사이즈 입력</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Width Input */}
            <div className="space-y-2">
              <Label htmlFor="width" className="text-sm font-medium">
                폭 (mm) *
              </Label>
              <div className="relative">
                <Input
                  id="width"
                  type="text"
                  value={width}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  placeholder="예: 400"
                  className={cn(
                    "pr-12",
                    isWidthValid === false ? "border-red-500 focus-visible:ring-red-500" :
                    isWidthValid === true ? "border-green-500 focus-visible:ring-green-500" :
                    ""
                  )}
                />
                <div className="absolute right-3 top-3 text-xs text-gray-500">
                  mm
                </div>
                {widthNum > 0 && (
                  <div className="absolute right-12 top-3">
                    {isWidthValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {sizeValidation.width.message && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {sizeValidation.width.message}
                </motion.p>
              )}
              <p className="text-xs text-gray-500">
                {selectedProduct.minWidth}mm ~ {selectedProduct.maxWidth}mm 범위 내에서 입력
              </p>
            </div>

            {/* Length Input */}
            <div className="space-y-2">
              <Label htmlFor="length" className="text-sm font-medium">
                길이 (mm) *
              </Label>
              <div className="relative">
                <Input
                  id="length"
                  type="text"
                  value={length}
                  onChange={(e) => handleLengthChange(e.target.value)}
                  placeholder="예: 600"
                  className={cn(
                    "pr-12",
                    isLengthValid === false ? "border-red-500 focus-visible:ring-red-500" :
                    isLengthValid === true ? "border-green-500 focus-visible:ring-green-500" :
                    ""
                  )}
                />
                <div className="absolute right-3 top-3 text-xs text-gray-500">
                  mm
                </div>
                {lengthNum > 0 && (
                  <div className="absolute right-12 top-3">
                    {isLengthValid ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              {sizeValidation.length.message && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600"
                >
                  {sizeValidation.length.message}
                </motion.p>
              )}
              <p className="text-xs text-gray-500">
                {selectedProduct.minLength}mm ~ {selectedProduct.maxLength}mm 범위 내에서 입력
              </p>
            </div>

            {/* Quantity Input */}
            <div className="space-y-2">
              <Label htmlFor="quantity" className="text-sm font-medium">
                수량 *
              </Label>
              <div className="relative">
                <Input
                  id="quantity"
                  type="text"
                  value={quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  placeholder="1"
                  className={cn(
                    "pr-8",
                    isQuantityValid === false ? "border-red-500 focus-visible:ring-red-500" :
                    isQuantityValid === true && quantityNum > 0 ? "border-green-500 focus-visible:ring-green-500" :
                    ""
                  )}
                />
                <div className="absolute right-3 top-3 text-xs text-gray-500">
                  개
                </div>
                {quantityNum > 0 && (
                  <div className="absolute right-10 top-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">
                최소 1개 이상 입력하세요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Size Preview and Calculations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Calculator className="w-5 h-5 mr-2" />
              계산 미리보기
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {area > 0 ? (
              <>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">개당 면적:</span>
                    <span className="font-semibold">{area.toFixed(4)} m²</span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">총 면적:</span>
                    <span className="font-semibold text-lg">{totalArea.toFixed(4)} m²</span>
                  </div>

                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="text-sm text-primary">예상 기본 금액:</span>
                    <span className="font-bold text-lg text-primary">
                      {(selectedProduct.basePrice * totalArea).toLocaleString()}원
                    </span>
                  </div>
                </div>

                {/* Discount Information */}
                {quantityNum > 0 && selectedProduct.discountRates.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-green-600">적용 가능한 할인</h4>
                    {selectedProduct.discountRates
                      .filter(rate => quantityNum >= rate.minQuantity && quantityNum <= rate.maxQuantity)
                      .map((rate, index) => (
                        <Badge key={index} variant="secondary" className="bg-green-100 text-green-800">
                          {rate.rate}% 할인 적용
                        </Badge>
                      ))}
                  </div>
                )}

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    실제 가격은 가공 옵션과 부자재에 따라 달라질 수 있습니다.
                    다음 단계에서 정확한 가격을 확인하실 수 있습니다.
                  </AlertDescription>
                </Alert>
              </>
            ) : (
              <div className="text-center py-8">
                <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">사이즈와 수량을 입력하면<br />계산 미리보기가 표시됩니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Next Button */}
      <AnimatePresence>
        {canProceed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="flex justify-center mt-8"
          >
            <Button
              size="lg"
              onClick={handleNext}
              className="px-8 py-3 text-lg"
            >
              가공 옵션 선택하기
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Validation Summary */}
      <AnimatePresence>
        {(widthNum > 0 || lengthNum > 0 || quantityNum > 0) && !canProceed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {!isWidthValid && "폭을 올바르게 입력해주세요. "}
                {!isLengthValid && "길이를 올바르게 입력해주세요. "}
                {!isQuantityValid && "수량은 1개 이상이어야 합니다."}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}