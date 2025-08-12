'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Calculator, TrendingDown, Eye, EyeOff, Info, Percent } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { selectCurrentItemPrice } from '@/store/slices/cartSlice';
import { togglePriceBreakdown } from '@/store/slices/uiSlice';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface PriceCalculatorProps {
  className?: string;
  showDetailed?: boolean;
}

export function PriceCalculator({ className, showDetailed = true }: PriceCalculatorProps) {
  const dispatch = useAppDispatch();
  const { selectedProduct } = useAppSelector((state) => state.products);
  const { currentItem } = useAppSelector((state) => state.cart);
  const { showPriceBreakdown } = useAppSelector((state) => state.ui);
  const priceBreakdown = useAppSelector(selectCurrentItemPrice);

  const handleToggleBreakdown = () => {
    dispatch(togglePriceBreakdown());
  };

  if (!selectedProduct || !currentItem?.width || !currentItem?.length || !currentItem?.quantity) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Calculator className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">목재와 사이즈를 선택하면<br />실시간 가격이 표시됩니다</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const area = (currentItem.width * currentItem.length) / 1000000; // m²
  const totalArea = area * (currentItem.quantity || 0);
  
  // Find applicable discount rate
  const applicableDiscount = selectedProduct.discountRates.find(rate => 
    (currentItem.quantity || 0) >= rate.minQuantity && (currentItem.quantity || 0) <= rate.maxQuantity
  );

  // Calculate unit costs for display
  const unitBasePrice = selectedProduct.basePrice * area;
  const unitBasePriceWithLoss = unitBasePrice * (1 + selectedProduct.lossRate / 100);

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center text-lg">
            <Calculator className="w-5 h-5 mr-2" />
            실시간 가격 계산
          </CardTitle>
          {showDetailed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleBreakdown}
              className="text-xs"
            >
              {showPriceBreakdown ? (
                <>
                  <EyeOff className="w-4 h-4 mr-1" />
                  간단히
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-1" />
                  자세히
                </>
              )}
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Quick Summary */}
        <div className="space-y-3">
          <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm text-gray-600">수량</div>
              <div className="font-medium">{currentItem.quantity || 0}개</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">총 면적</div>
              <div className="font-medium">{totalArea.toFixed(4)} m²</div>
            </div>
          </div>

          {/* Discount Badge */}
          {applicableDiscount && applicableDiscount.rate > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center"
            >
              <Badge className="bg-green-500 text-white">
                <Percent className="w-3 h-3 mr-1" />
                {applicableDiscount.rate}% 수량 할인 적용!
              </Badge>
            </motion.div>
          )}
        </div>

        <Separator />

        {/* Detailed Breakdown */}
        <AnimatePresence>
          {showPriceBreakdown && showDetailed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-3"
            >
              {/* Base Price Calculation */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700">기본 금액 계산</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">기본 단가 ({selectedProduct.basePrice.toLocaleString()}원/m²)</span>
                    <span>{selectedProduct.basePrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">개당 면적</span>
                    <span>{area.toFixed(4)} m²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">개당 기본 금액</span>
                    <span>{unitBasePrice.toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">로스율 적용 ({selectedProduct.lossRate}%)</span>
                    <span>+{(unitBasePriceWithLoss - unitBasePrice).toLocaleString()}원</span>
                  </div>
                  <div className="flex justify-between items-center font-medium">
                    <span>개당 최종 기본 금액</span>
                    <span>{unitBasePriceWithLoss.toLocaleString()}원</span>
                  </div>
                </div>
              </div>

              <Separator className="my-2" />

              {/* Work Options */}
              {priceBreakdown.workOptionsPrice > 0 && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">가공 옵션</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">선택한 가공 옵션</span>
                      <span>{priceBreakdown.workOptionsPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                </>
              )}

              {/* Materials */}
              {priceBreakdown.materialsPrice > 0 && (
                <>
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">부자재</h4>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">선택한 부자재</span>
                      <span>{priceBreakdown.materialsPrice.toLocaleString()}원</span>
                    </div>
                  </div>
                  <Separator className="my-2" />
                </>
              )}

              {/* Subtotal and Discount */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">소계</span>
                  <span>{priceBreakdown.subtotal.toLocaleString()}원</span>
                </div>
                
                {priceBreakdown.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span className="flex items-center">
                      <TrendingDown className="w-4 h-4 mr-1" />
                      수량 할인 ({applicableDiscount?.rate}%)
                    </span>
                    <span>-{priceBreakdown.discountAmount.toLocaleString()}원</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Separator />

        {/* Final Price */}
        <motion.div 
          className="p-4 bg-primary/10 rounded-lg"
          animate={{ 
            scale: priceBreakdown.finalPrice > 0 ? [1, 1.02, 1] : 1 
          }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-primary font-medium">최종 금액</div>
              <div className="text-xs text-primary/80">100원 단위 할인 적용</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">
                {priceBreakdown.finalPrice.toLocaleString()}원
              </div>
              {priceBreakdown.discountAmount > 0 && (
                <div className="text-xs text-green-600">
                  {priceBreakdown.discountAmount.toLocaleString()}원 절약!
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Additional Information */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription className="text-xs">
            • 가격은 실시간으로 계산되며, 최종 주문 시 확정됩니다<br/>
            • 부가세(10%)는 별도입니다<br/>
            • 배송비는 지역에 따라 별도 산정됩니다
          </AlertDescription>
        </Alert>

        {/* Quantity Discount Information */}
        {selectedProduct.discountRates.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">수량별 할인율</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {selectedProduct.discountRates
                .filter(rate => rate.rate > 0)
                .map((rate, index) => (
                  <div 
                    key={index}
                    className={cn(
                      "p-2 rounded border text-center",
                      (currentItem.quantity || 0) >= rate.minQuantity && (currentItem.quantity || 0) <= rate.maxQuantity
                        ? "bg-green-100 border-green-300 text-green-800"
                        : "bg-gray-50 border-gray-200 text-gray-600"
                    )}
                  >
                    <div className="font-medium">{rate.minQuantity}개 이상</div>
                    <div className="text-xs">{rate.rate}% 할인</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}