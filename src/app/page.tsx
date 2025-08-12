'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '@/store';
import { fetchCategories, fetchWorkOptions, fetchMaterials } from '@/store/slices/productsSlice';
import { StepIndicator } from '@/components/StepIndicator';
import { ProductSelector } from '@/components/ProductSelector';
import { SizeInput } from '@/components/SizeInput';
import { WorkOptionSelector } from '@/components/WorkOptionSelector';
import { PriceCalculator } from '@/components/PriceCalculator';
import { ShoppingCart } from '@/components/ShoppingCart';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  ArrowRight, 
  Phone, 
  MessageCircle, 
  Mail,
  MapPin,
  Clock,
  Shield,
  Award,
  Truck
} from 'lucide-react';
import { previousStep, nextStep, setCurrentStep } from '@/store/slices/uiSlice';
import { StepNumber } from '@/types';

export default function HomePage() {
  const dispatch = useAppDispatch();
  const { currentStep } = useAppSelector(state => state.ui);
  const { selectedProduct } = useAppSelector(state => state.products);
  const { currentItem } = useAppSelector(state => state.cart);

  useEffect(() => {
    // Initialize data on app load
    dispatch(fetchCategories());
    dispatch(fetchWorkOptions());
    dispatch(fetchMaterials());
  }, [dispatch]);

  const handlePrevious = () => {
    dispatch(previousStep());
  };

  const handleNext = () => {
    dispatch(nextStep());
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <ProductSelector />
          </div>
        );
        
      case 2:
        return (
          <div className="space-y-8">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <SizeInput />
              </div>
              <div className="space-y-6">
                <PriceCalculator showDetailed={true} />
              </div>
            </div>
          </div>
        );
        
      case 3:
        return (
          <div className="space-y-8">
            <WorkOptionSelector />
          </div>
        );
        
      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">부자재를 선택하세요</h2>
              <p className="text-gray-600">목공 프로젝트에 필요한 부자재를 추가로 선택할 수 있습니다.</p>
            </div>
            
            {/* Material Selection Placeholder */}
            <Card>
              <CardContent className="py-12 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">🔧</div>
                  <h3 className="text-xl font-semibold text-gray-900">부자재 선택</h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    나사, 경첩, 페인트 등 다양한 부자재를 선택할 수 있습니다. 
                    현재는 다음 단계로 진행하여 장바구니를 확인하세요.
                  </p>
                  <Button onClick={handleNext} size="lg" className="mt-4">
                    장바구니 확인하기
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );
        
      case 5:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">주문서를 확인하세요</h2>
              <p className="text-gray-600">선택한 모든 항목과 최종 가격을 확인해주세요.</p>
            </div>
            
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <ShoppingCart 
                  showAddToCart={true} 
                  allowCheckout={false}
                />
              </div>
              <div className="space-y-6">
                <PriceCalculator showDetailed={true} />
                
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">다음 단계</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">
                      주문서 확인이 완료되면 개인정보를 입력하고 주문서를 제출할 수 있습니다.
                    </p>
                    <Button onClick={handleNext} size="lg" className="w-full">
                      개인정보 입력하기
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        );
        
      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">개인정보를 입력하세요</h2>
              <p className="text-gray-600">주문서 발송을 위한 개인정보를 입력해주세요.</p>
            </div>
            
            {/* Customer Info Form Placeholder */}
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader>
                  <CardTitle>고객 정보 입력</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        입력하신 개인정보는 주문 처리 및 배송을 위해서만 사용되며, 
                        개인정보 보호법에 따라 안전하게 관리됩니다.
                      </AlertDescription>
                    </Alert>
                    
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">📝</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">고객 정보 입력 폼</h3>
                      <p className="text-gray-600 mb-6">
                        이름, 이메일, 전화번호, 회사명(선택) 등을 입력하는 폼이 여기에 위치합니다.
                      </p>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center justify-center">
                          <Mail className="w-4 h-4 mr-2" />
                          <span>주문서는 이메일로 발송됩니다</span>
                        </div>
                        <div className="flex items-center justify-center">
                          <Phone className="w-4 h-4 mr-2" />
                          <span>배송 관련 연락을 위해 전화번호가 필요합니다</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );
        
      default:
        return <div>알 수 없는 단계입니다.</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">조은나무</h1>
              <Badge variant="secondary" className="hidden sm:block">
                목재재단 서비스
              </Badge>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Consultation Button */}
              <Button variant="outline" size="sm" className="hidden md:flex">
                <MessageCircle className="w-4 h-4 mr-2" />
                실시간 상담
              </Button>
              
              {/* Phone */}
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Phone className="w-4 h-4 mr-2" />
                1588-0000
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Step Indicator */}
      <StepIndicator />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="min-h-[60vh]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            이전 단계
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {currentStep} / 6 단계
            </span>
          </div>
          
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentStep === 6}
            className="flex items-center"
          >
            다음 단계
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">조은나무</h3>
              <p className="text-gray-600 text-sm mb-4">
                온라인 목재 재단 및 가공 주문 플랫폼으로, 
                DIY 목공 애호가와 소상공인을 위한 맞춤형 서비스를 제공합니다.
              </p>
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="flex items-center">
                  <Award className="w-3 h-3 mr-1" />
                  품질보증
                </Badge>
                <Badge variant="outline" className="flex items-center">
                  <Truck className="w-3 h-3 mr-1" />
                  전국배송
                </Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">서비스</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>목재 재단</li>
                <li>가공 서비스</li>
                <li>부자재 판매</li>
                <li>실시간 상담</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">고객지원</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  1588-0000
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  help@ecogoodtree.com
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  평일 9:00-18:00
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">회사정보</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  서울특별시 강남구
                </div>
                <div>사업자등록번호: 000-00-00000</div>
                <div>통신판매업신고: 제2024-서울강남-0000호</div>
              </div>
            </div>
          </div>
          
          <Separator className="my-8" />
          
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
            <div>
              © 2024 조은나무. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-gray-700">개인정보처리방침</a>
              <a href="#" className="hover:text-gray-700">이용약관</a>
              <a href="#" className="hover:text-gray-700">사업자정보확인</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}