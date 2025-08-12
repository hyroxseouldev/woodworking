"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  Settings,
  ArrowRight,
  MessageSquare,
  DollarSign,
} from "lucide-react";
import { useAppSelector, useAppDispatch } from "@/store";
import { fetchWorkOptions } from "@/store/slices/productsSlice";
import { updateCurrentItem } from "@/store/slices/cartSlice";
import { nextStep, addNotification } from "@/store/slices/uiSlice";
import { cn } from "@/lib/utils";

interface WorkOptionSelectorProps {
  className?: string;
}

export function WorkOptionSelector({ className }: WorkOptionSelectorProps) {
  const dispatch = useAppDispatch();
  const { workOptions } = useAppSelector((state) => state.products);
  const { currentItem } = useAppSelector((state) => state.cart);
  const { selectedProduct } = useAppSelector((state) => state.products);

  const [selectedOptions, setSelectedOptions] = useState<string[]>(
    currentItem?.workOptions || []
  );
  const [customRequest, setCustomRequest] = useState(
    currentItem?.customRequest || ""
  );

  useEffect(() => {
    if (workOptions.length === 0) {
      dispatch(fetchWorkOptions());
    }
  }, [dispatch, workOptions.length]);

  useEffect(() => {
    // Update current item when selections change
    dispatch(
      updateCurrentItem({
        ...currentItem,
        workOptions: selectedOptions,
        customRequest,
      })
    );
  }, [dispatch, selectedOptions, customRequest, currentItem]);

  const handleOptionToggle = (optionId: string) => {
    setSelectedOptions((prev) => {
      const newSelection = prev.includes(optionId)
        ? prev.filter((id) => id !== optionId)
        : [...prev, optionId];

      // Show notification for selection change
      const option = workOptions.find((wo) => wo.id === optionId);
      if (option) {
        dispatch(
          addNotification({
            type: prev.includes(optionId) ? "info" : "success",
            title: prev.includes(optionId)
              ? "가공 옵션 해제"
              : "가공 옵션 선택",
            message: `${option.title}이(가) ${
              prev.includes(optionId) ? "해제" : "선택"
            }되었습니다.`,
          })
        );
      }

      return newSelection;
    });
  };

  const handleNext = () => {
    dispatch(nextStep());
  };

  const calculateOptionPrice = (option: { basePrice: number; additionalPrice: number }) => {
    if (!currentItem?.width || !currentItem?.length || !currentItem?.quantity) {
      return option.basePrice;
    }

    const area = (currentItem.width * currentItem.length) / 1000000; // m²
    const totalPrice = option.basePrice + option.additionalPrice * area;
    return totalPrice * currentItem.quantity;
  };

  const selectedWorkOptions = workOptions.filter((option) =>
    selectedOptions.includes(option.id)
  );
  const totalOptionsPrice = selectedWorkOptions.reduce(
    (sum, option) => sum + calculateOptionPrice(option),
    0
  );

  if (!selectedProduct || !currentItem?.width || !currentItem?.length) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-gray-600">먼저 목재와 사이즈를 선택해주세요.</p>
      </div>
    );
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          가공 옵션을 선택하세요
        </h2>
        <p className="text-gray-600">
          필요한 가공 서비스를 선택하여 더욱 완성도 높은 목재를 받아보세요.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Work Options Selection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-gray-900">가공 옵션</h3>
            <Badge variant="outline">{selectedOptions.length}개 선택됨</Badge>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <AnimatePresence>
              {workOptions.map((option, index) => {
                const isSelected = selectedOptions.includes(option.id);
                const price = calculateOptionPrice(option);

                return (
                  <motion.div
                    key={option.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card
                      className={cn(
                        "cursor-pointer transition-all duration-200 hover:shadow-md",
                        isSelected
                          ? "ring-2 ring-primary shadow-lg bg-primary/5"
                          : "hover:ring-1 hover:ring-gray-300"
                      )}
                      onClick={() => handleOptionToggle(option.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleOptionToggle(option.id)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <CardTitle className="text-base mb-1">
                                {option.title}
                              </CardTitle>
                              <CardDescription className="text-sm">
                                {option.description}
                              </CardDescription>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-semibold text-primary">
                              {price.toLocaleString()}원
                            </div>
                            {option.basePrice > 0 && (
                              <div className="text-xs text-gray-500">
                                기본 {option.basePrice.toLocaleString()}원
                              </div>
                            )}
                          </div>
                        </div>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {option.additionalPrice > 0 && (
                          <div className="text-xs text-gray-500">
                            + {option.additionalPrice.toLocaleString()}원/m² ×
                            면적 × 수량
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Custom Request */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <MessageSquare className="w-5 h-5 mr-2" />
                추가 요청사항
              </CardTitle>
              <CardDescription>
                특별한 가공이나 주의사항이 있다면 자세히 적어주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="예: 모서리를 둥글게 처리해주세요, 구멍 위치는 중앙에서 10mm 떨어진 곳에..."
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                추가 비용이 발생할 수 있으며, 상담을 통해 정확한 견적을
                안내드립니다.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Selection Summary */}
        <div className="space-y-4">
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Settings className="w-5 h-5 mr-2" />
                선택 요약
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Product Info */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  선택된 목재
                </h4>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium">
                    {selectedProduct.title}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {currentItem.width}mm × {currentItem.length}mm ×{" "}
                    {currentItem.quantity}개
                  </div>
                  <div className="text-xs text-gray-600">
                    총 면적:{" "}
                    {(
                      (currentItem.width *
                        currentItem.length *
                        (currentItem.quantity ?? 1)) /
                      1000000
                    ).toFixed(4)}
                    m²
                  </div>
                </div>
              </div>

              <Separator />

              {/* Selected Options */}
              <div className="space-y-2">
                <h4 className="font-medium text-sm text-gray-700">
                  선택된 가공 ({selectedOptions.length}개)
                </h4>
                {selectedWorkOptions.length > 0 ? (
                  <div className="space-y-2">
                    {selectedWorkOptions.map((option) => (
                      <div
                        key={option.id}
                        className="flex justify-between items-center p-2 bg-primary/5 rounded-lg"
                      >
                        <div className="text-sm">{option.title}</div>
                        <div className="text-sm font-medium text-primary">
                          {calculateOptionPrice(option).toLocaleString()}원
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    선택된 가공 옵션이 없습니다.
                  </p>
                )}
              </div>

              {/* Custom Request Summary */}
              {customRequest && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-700">
                      추가 요청사항
                    </h4>
                    <div className="p-2 bg-yellow-50 rounded-lg text-sm text-gray-700">
                      {customRequest.length > 50
                        ? `${customRequest.substring(0, 50)}...`
                        : customRequest}
                    </div>
                  </div>
                </>
              )}

              <Separator />

              {/* Total Options Price */}
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                <span className="font-medium text-primary">
                  가공 옵션 합계:
                </span>
                <span className="font-bold text-lg text-primary">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  {totalOptionsPrice.toLocaleString()}원
                </span>
              </div>

              <div className="text-xs text-gray-500 text-center">
                목재 기본 금액은 다음 단계에서 확인됩니다
              </div>
            </CardContent>
          </Card>

          {/* Next Button */}
          <Button size="lg" onClick={handleNext} className="w-full">
            부자재 선택하기
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>

          {/* Skip Options */}
          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            className="w-full"
          >
            가공 없이 진행
          </Button>
        </div>
      </div>
    </div>
  );
}
