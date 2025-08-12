'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ShoppingCart as ShoppingCartIcon, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  Package, 
  Ruler,
  Settings,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '@/store';
import { 
  selectCartItems, 
  selectCartTotals, 
  updateQuantity, 
  removeFromCart, 
  clearCart,
  addToCart,
  clearCurrentItem
} from '@/store/slices/cartSlice';
import { nextStep, addNotification } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils';

interface ShoppingCartProps {
  className?: string;
  showAddToCart?: boolean;
  allowCheckout?: boolean;
}

export function ShoppingCart({ className, showAddToCart = false, allowCheckout = false }: ShoppingCartProps) {
  const dispatch = useAppDispatch();
  const cartItems = useAppSelector(selectCartItems);
  const cartTotals = useAppSelector(selectCartTotals);
  const { currentItem } = useAppSelector(state => state.cart);
  const { selectedProduct, workOptions, materials, categories } = useAppSelector(state => state.products);

  // Get all products from categories
  const allProducts = categories.flatMap(cat => cat.products);

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
    } else {
      dispatch(updateQuantity({ id: itemId, quantity: newQuantity }));
      dispatch(addNotification({
        type: 'info',
        title: '수량 변경',
        message: `수량이 ${newQuantity}개로 변경되었습니다.`
      }));
    }
  };

  const handleRemoveItem = (itemId: string) => {
    dispatch(removeFromCart(itemId));
    dispatch(addNotification({
      type: 'success',
      title: '항목 삭제',
      message: '장바구니에서 항목이 제거되었습니다.'
    }));
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    dispatch(addNotification({
      type: 'info',
      title: '장바구니 비움',
      message: '장바구니가 비워졌습니다.'
    }));
  };

  const handleAddCurrentToCart = () => {
    if (currentItem && selectedProduct && currentItem.width && currentItem.length && currentItem.quantity) {
      dispatch(addToCart({
        productId: currentItem.productId!,
        width: currentItem.width,
        length: currentItem.length,
        quantity: currentItem.quantity,
        workOptions: currentItem.workOptions || [],
        materials: currentItem.materials || [],
        customRequest: currentItem.customRequest || '',
      }));
      
      dispatch(addNotification({
        type: 'success',
        title: '장바구니 추가',
        message: `${selectedProduct.title}이(가) 장바구니에 추가되었습니다.`
      }));
    }
  };

  const handleCheckout = () => {
    if (cartItems.length > 0) {
      dispatch(nextStep());
    }
  };

  const getProductById = (productId: string) => {
    return allProducts.find(p => p.id === productId);
  };

  const getWorkOptionsByIds = (optionIds: string[]) => {
    return workOptions.filter(option => optionIds.includes(option.id));
  };

  const getMaterialsByIds = (materialIds: { id: string; quantity: number }[]) => {
    return materialIds.map(item => {
      const material = materials.find(m => m.id === item.id);
      return material ? { ...material, orderQuantity: item.quantity } : null;
    }).filter(Boolean);
  };

  if (cartItems.length === 0 && !showAddToCart) {
    return (
      <Card className={cn("", className)}>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <ShoppingCartIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">장바구니가 비어있습니다</h3>
            <p className="text-gray-500 mb-6">원하는 목재를 선택하고 장바구니에 추가해보세요.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Add to Cart Section */}
      {showAddToCart && currentItem && selectedProduct && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Package className="w-5 h-5 mr-2" />
              현재 구성 중인 항목
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{selectedProduct.title}</h4>
                  <div className="text-sm text-gray-600 space-y-1 mt-1">
                    <div className="flex items-center">
                      <Ruler className="w-4 h-4 mr-1" />
                      {currentItem.width}mm × {currentItem.length}mm × {currentItem.quantity}개
                    </div>
                    {currentItem.workOptions && currentItem.workOptions.length > 0 && (
                      <div className="flex items-center">
                        <Settings className="w-4 h-4 mr-1" />
                        가공: {getWorkOptionsByIds(currentItem.workOptions).map(opt => opt.title).join(', ')}
                      </div>
                    )}
                    {currentItem.customRequest && (
                      <div className="flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" />
                        추가 요청: {currentItem.customRequest.length > 30 ? 
                          `${currentItem.customRequest.substring(0, 30)}...` : 
                          currentItem.customRequest}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleAddCurrentToCart} 
                className="w-full"
                disabled={!currentItem.width || !currentItem.length || !currentItem.quantity}
              >
                <Plus className="w-4 h-4 mr-2" />
                장바구니에 추가
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cart Items */}
      {cartItems.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center text-lg">
                <ShoppingCartIcon className="w-5 h-5 mr-2" />
                장바구니 ({cartTotals.totalItems}개)
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearCart}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                전체 삭제
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <AnimatePresence>
              {cartItems.map((item, index) => {
                const product = getProductById(item.productId);
                const selectedWorkOptions = getWorkOptionsByIds(item.workOptions);
                const selectedMaterials = getMaterialsByIds(item.materials);
                const area = (item.width * item.length) / 1000000; // m²

                if (!product) return null;

                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="border rounded-lg p-4 space-y-4"
                  >
                    {/* Product Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{product.title}</h4>
                        <div className="text-sm text-gray-600 mt-1">
                          <div className="flex items-center mb-1">
                            <Ruler className="w-4 h-4 mr-1" />
                            {item.width}mm × {item.length}mm (면적: {(area * item.quantity).toFixed(4)}m²)
                          </div>
                          <div className="text-xs text-gray-500">
                            기본가: {product.basePrice.toLocaleString()}원/m² × {(area * item.quantity).toFixed(4)}m²
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-lg font-semibold text-primary">
                          {item.calculatedPrice.toLocaleString()}원
                        </div>
                        <div className="text-xs text-gray-500">
                          개당 {(item.calculatedPrice / item.quantity).toLocaleString()}원
                        </div>
                      </div>
                    </div>

                    {/* Work Options */}
                    {selectedWorkOptions.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">선택한 가공:</div>
                        <div className="flex flex-wrap gap-1">
                          {selectedWorkOptions.map(option => (
                            <Badge key={option.id} variant="secondary" className="text-xs">
                              <Settings className="w-3 h-3 mr-1" />
                              {option.title}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Materials */}
                    {selectedMaterials.length > 0 && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">선택한 부자재:</div>
                        <div className="space-y-1">
                          {selectedMaterials.map((material: any) => (
                            <div key={material.id} className="text-xs text-gray-600 flex justify-between">
                              <span>{material.title}</span>
                              <span>{material.orderQuantity}개 × {material.discountPrice || material.price}원</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Custom Request */}
                    {item.customRequest && (
                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-1">추가 요청:</div>
                        <div className="text-sm text-gray-600 bg-yellow-50 p-2 rounded">
                          <MessageSquare className="w-4 h-4 inline mr-1" />
                          {item.customRequest}
                        </div>
                      </div>
                    )}

                    {/* Quantity Controls */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium">수량:</span>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="text-sm font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {cartItems.length > 0 && (
              <>
                <Separator />
                
                {/* Cart Totals */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span>총 상품 수량:</span>
                    <span className="font-medium">{cartTotals.totalItems}개</span>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <span>상품 금액:</span>
                    <span className="font-medium">{cartTotals.totalPrice.toLocaleString()}원</span>
                  </div>
                  
                  {cartTotals.discountAmount > 0 && (
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>할인 금액:</span>
                      <span className="font-medium">-{cartTotals.discountAmount.toLocaleString()}원</span>
                    </div>
                  )}
                  
                  <Separator />
                  
                  <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg">
                    <span className="font-semibold text-primary">최종 결제 금액:</span>
                    <span className="text-xl font-bold text-primary">
                      {cartTotals.finalPrice.toLocaleString()}원
                    </span>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    • 부가세(10%) 별도<br/>
                    • 배송비는 지역에 따라 별도 산정<br/>
                    • 100원 단위 할인이 적용된 금액입니다
                  </AlertDescription>
                </Alert>

                {/* Checkout Button */}
                {allowCheckout && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="pt-4"
                  >
                    <Button
                      size="lg"
                      onClick={handleCheckout}
                      className="w-full text-lg py-3"
                      disabled={cartItems.length === 0}
                    >
                      주문서 확인하기
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </motion.div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}