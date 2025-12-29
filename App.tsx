import React, { useState } from 'react';
import { StoreType } from './types';
import StoreProcessor from './components/StoreProcessor';
import { LayoutDashboard, Building2, ShoppingBag, Landmark } from 'lucide-react';

function App() {
  const [activeTab, setActiveTab] = useState<StoreType>(StoreType.HYUNDAI);

  const tabs = [
    { id: StoreType.HYUNDAI, label: '현대백화점', icon: Building2, color: 'text-green-700', bg: 'bg-green-600' },
    { id: StoreType.SHINSEGAE, label: '신세계백화점', icon: Landmark, color: 'text-gray-700', bg: 'bg-gray-700' },
    { id: StoreType.LOTTE, label: '롯데백화점', icon: ShoppingBag, color: 'text-red-700', bg: 'bg-red-600' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Data Refinery</h1>
          </div>
          <div className="text-sm text-gray-500 font-medium">
            백화점 통합 데이터 전처리 시스템
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        
        <div className="mb-8">
           <h2 className="text-2xl font-bold text-gray-900">데이터 처리 대시보드</h2>
           <p className="text-gray-500 mt-1">처리할 백화점을 선택하고 데이터를 업로드하세요ㅋㅋㅋ</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-200/50 p-1 rounded-xl mb-6 max-w-2xl">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200
                  ${isActive 
                    ? 'bg-white text-gray-900 shadow-sm ring-1 ring-black/5' 
                    : 'text-gray-500 hover:text-gray-700 hover:bg-white/50'}
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? tab.color : 'text-gray-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Dynamic Content Area */}
        <div className="max-w-4xl">
          {activeTab === StoreType.HYUNDAI && (
            <StoreProcessor 
              store={StoreType.HYUNDAI} 
              colorTheme="bg-green-600" 
            />
          )}
          {activeTab === StoreType.SHINSEGAE && (
            <StoreProcessor 
              store={StoreType.SHINSEGAE} 
              colorTheme="bg-gray-800" 
            />
          )}
          {activeTab === StoreType.LOTTE && (
            <StoreProcessor 
              store={StoreType.LOTTE} 
              colorTheme="bg-red-600" 
            />
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-gray-400">
          &copy; {new Date().getFullYear()} Department Store Data Refinery Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default App;
