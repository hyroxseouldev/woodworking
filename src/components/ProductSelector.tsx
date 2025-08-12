'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowRight, Ruler, Weight, Scissors } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchCategories, selectCategory, selectProduct } from '@/store/slices/productsSlice';
import { nextStep, addNotification } from '@/store/slices/uiSlice';
import { LumberCategory, Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductSelectorProps {
  className?: string;
}

export function ProductSelector({ className }: ProductSelectorProps) {
  const dispatch = useAppDispatch();
  const { 
    categories, 
    selectedCategory, 
    selectedProduct, 
    loading, 
    error 
  } = useAppSelector((state) => state.products);

  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories());
    }
  }, [dispatch, categories.length]);

  const handleCategorySelect = (categoryId: string) => {
    dispatch(selectCategory(categoryId));
  };

  const handleProductSelect = (product: Product) => {
    dispatch(selectProduct(product));
    dispatch(addNotification({
      type: 'success',
      title: '제품 선택 완료',
      message: `${product.title}이(가) 선택되었습니다.`
    }));
  };

  const handleNext = () => {
    if (selectedProduct) {
      dispatch(nextStep());
    }
  };

  if (loading) {
    return (
      <div className={cn("flex items-center justify-center py-12", className)}>
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-2 text-gray-600">목재 정보를 불러오고 있습니다...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-center py-12", className)}>
        <p className="text-red-600 mb-4">{error}</p>
        <Button onClick={() => dispatch(fetchCategories())}>
          다시 시도
        </Button>
      </div>
    );
  }

  const categoryMap = {
    panel: { icon: '📋', name: '판재', description: '평평한 판 형태' },
    lumber: { icon: '🪵', name: '각재', description: '각진 형태' },
    round: { icon: '🥢', name: '원형봉', description: '원형 봉 형태' },
  };

  return (
    <div className={cn("w-full max-w-6xl mx-auto", className)}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">목재 종류를 선택하세요</h2>
        <p className="text-gray-600">원하는 목재 유형을 선택하고, 세부 제품을 확인해보세요.</p>
      </div>

      <Tabs 
        value={selectedCategory || undefined} 
        onValueChange={handleCategorySelect}
        className="w-full"
      >
        <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1">
          {categories.map((category) => {
            const categoryInfo = categoryMap[category.type as keyof typeof categoryMap];
            return (
              <TabsTrigger
                key={category.id}
                value={category.id}
                className="flex flex-col items-center p-6 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <div className="text-2xl mb-2">{categoryInfo?.icon}</div>
                <div className="font-semibold">{categoryInfo?.name}</div>
                <div className="text-xs opacity-80 mt-1">{categoryInfo?.description}</div>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {category.name} 제품
                </h3>
                <p className="text-gray-600">{category.description}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                  {category.products.map((product, index) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1,
                        ease: "easeOut"
                      }}
                    >
                      <Card 
                        className={cn(
                          "cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
                          selectedProduct?.id === product.id 
                            ? "ring-2 ring-primary shadow-lg bg-primary/5" 
                            : "hover:ring-1 hover:ring-gray-300"
                        )}
                        onClick={() => handleProductSelect(product)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">
                                {product.title}
                              </CardTitle>
                              <div className="flex flex-wrap gap-1 mb-2">
                                {product.keywords.slice(0, 2).map((keyword) => (
                                  <Badge key={keyword} variant="secondary" className="text-xs">
                                    {keyword}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-bold text-primary">
                                {product.basePrice.toLocaleString()}원
                              </div>
                              <div className="text-xs text-gray-500">per m²</div>
                            </div>
                          </div>
                        </CardHeader>
                        
                        <CardContent className="pt-0">
                          <div className="space-y-3">
                            {/* Product specifications */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div className="flex items-center text-gray-600">
                                <Ruler className="w-4 h-4 mr-1" />
                                <span>두께: {product.thickness}mm</span>
                              </div>
                              <div className="flex items-center text-gray-600">
                                <Weight className="w-4 h-4 mr-1" />
                                <span>{product.weight}kg/m²</span>
                              </div>
                            </div>
                            
                            {/* Size ranges */}
                            <div className="text-sm text-gray-600">
                              <div className="flex items-center mb-1">
                                <Scissors className="w-4 h-4 mr-1" />
                                <span>사이즈 범위</span>
                              </div>
                              <div className="ml-5 space-y-1">
                                <div>폭: {product.minWidth}~{product.maxWidth}mm</div>
                                <div>길이: {product.minLength}~{product.maxLength}mm</div>
                              </div>
                            </div>

                            {/* Discount information */}
                            {product.discountRates.length > 0 && (
                              <div className="text-sm">
                                <div className="text-green-600 font-medium mb-1">수량 할인</div>
                                <div className="space-y-1">
                                  {product.discountRates
                                    .filter(rate => rate.rate > 0)
                                    .slice(0, 2)
                                    .map((rate, index) => (
                                    <div key={index} className="text-xs text-green-600">
                                      {rate.minQuantity}개 이상: {rate.rate}% 할인
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Next button */}
      <AnimatePresence>
        {selectedProduct && (
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
              다음 단계로
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}