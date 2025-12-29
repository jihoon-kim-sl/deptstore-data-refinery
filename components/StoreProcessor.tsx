import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckSquare, FileSpreadsheet, Download, Loader2, RefreshCw, XCircle } from 'lucide-react';
import { StoreType, ParsedFile } from '../types';
import { parseFile, downloadCSV } from '../services/fileService';
import { suggestColumns } from '../services/geminiService';

interface StoreProcessorProps {
  store: StoreType;
  colorTheme: string;
}

const StoreProcessor: React.FC<StoreProcessorProps> = ({ store, colorTheme }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedFile | null>(null);
  const [selectedCols, setSelectedCols] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null);
    setParsedData(null);
    setSelectedCols(new Set());
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsLoading(true);
    setError(null);

    try {
      const parsed = await parseFile(selectedFile);
      setParsedData(parsed);
      
      // Auto-select all by default initially
      const allCols = new Set(parsed.headers);
      setSelectedCols(allCols);

      // Trigger AI suggestion
      handleAiSuggestion(parsed.headers);
      
    } catch (err: any) {
      setError(err.message || "Failed to parse file.");
      setFile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAiSuggestion = async (headers: string[]) => {
    setIsAiProcessing(true);
    try {
      const suggestions = await suggestColumns(store, headers);
      if (suggestions.length > 0) {
        setSelectedCols(new Set(suggestions));
      }
    } catch (err) {
      console.warn("AI suggestion skipped");
    } finally {
      setIsAiProcessing(false);
    }
  };

  const toggleColumn = (col: string) => {
    const newSet = new Set(selectedCols);
    if (newSet.has(col)) {
      newSet.delete(col);
    } else {
      newSet.add(col);
    }
    setSelectedCols(newSet);
  };

  const selectAll = () => {
    if (parsedData) {
      setSelectedCols(new Set(parsedData.headers));
    }
  };

  const deselectAll = () => {
    setSelectedCols(new Set());
  };

  const handleDownload = () => {
    if (!parsedData) return;
    if (selectedCols.size === 0) {
      setError("Please select at least one column to export.");
      return;
    }
    
    const suffixMap: Record<StoreType, string> = {
      [StoreType.HYUNDAI]: 'hyundai_processed',
      [StoreType.SHINSEGAE]: 'shinsegae_processed',
      [StoreType.LOTTE]: 'lotte_processed',
    };

    downloadCSV(
      parsedData.data, 
      Array.from(selectedCols), 
      parsedData.fileName, 
      suffixMap[store]
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header for the specific store card */}
      <div className={`px-6 py-4 border-b border-gray-100 ${colorTheme} bg-opacity-5`}>
        <h2 className={`text-lg font-semibold flex items-center gap-2 ${colorTheme.replace('bg-', 'text-')}`}>
          <FileSpreadsheet className="w-5 h-5" />
          {store} 데이터 전처리
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {store}의 raw 데이터를 업로드하여 필요한 컬럼만 추출하세요.
        </p>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-2 text-sm border border-red-100">
            <XCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {!parsedData ? (
          /* Upload State */
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:bg-gray-50 transition-colors relative">
             <input 
              type="file" 
              ref={fileInputRef}
              accept=".csv, .xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {isLoading ? (
              <div className="flex flex-col items-center justify-center text-gray-500">
                <Loader2 className="w-10 h-10 animate-spin mb-3 text-indigo-600" />
                <p>파일 분석 중...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-500 pointer-events-none">
                <Upload className="w-12 h-12 mb-3 text-gray-400" />
                <p className="font-medium text-gray-900 mb-1">파일 업로드 (Click or Drag)</p>
                <p className="text-sm text-gray-400">지원 형식: .csv, .xlsx</p>
              </div>
            )}
          </div>
        ) : (
          /* Process State */
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white rounded-md shadow-sm border border-gray-100">
                  <FileSpreadsheet className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{parsedData.fileName}</p>
                  <p className="text-xs text-gray-500">{parsedData.data.length.toLocaleString()} 행 발견</p>
                </div>
              </div>
              <button 
                onClick={reset}
                className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1 hover:underline"
              >
                <RefreshCw className="w-4 h-4" />
                초기화
              </button>
            </div>

            <div>
              <div className="flex justify-between items-end mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-gray-500" />
                    컬럼 선택 ({selectedCols.size} / {parsedData.headers.length})
                  </h3>
                  {isAiProcessing && (
                    <span className="text-xs text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-0.5 rounded-full animate-pulse">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      AI 분석 중...
                    </span>
                  )}
                </div>
                <div className="flex gap-2 text-xs">
                   <button onClick={selectAll} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">전체 선택</button>
                   <button onClick={deselectAll} className="px-2 py-1 text-gray-600 hover:bg-gray-100 rounded">전체 해제</button>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-80 overflow-y-auto p-2 border border-gray-100 rounded-lg custom-scrollbar">
                {parsedData.headers.map((header, index) => (
                  <label 
                    key={`${header}-${index}`} 
                    className={`
                      flex items-start gap-2 p-2 rounded cursor-pointer border text-sm transition-all
                      ${selectedCols.has(header) 
                        ? 'bg-blue-50 border-blue-200 text-blue-900' 
                        : 'bg-white border-gray-100 text-gray-500 hover:bg-gray-50'}
                    `}
                  >
                    <input 
                      type="checkbox" 
                      className="mt-0.5 w-4 h-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                      checked={selectedCols.has(header)}
                      onChange={() => toggleColumn(header)}
                    />
                    <span className="break-all">{header}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={handleDownload}
              disabled={selectedCols.size === 0}
              className={`
                w-full py-4 rounded-xl flex items-center justify-center gap-2 font-semibold shadow-sm transition-all
                ${selectedCols.size > 0 
                  ? 'bg-gray-900 text-white hover:bg-gray-800 hover:shadow-md' 
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
              `}
            >
              <Download className="w-5 h-5" />
              전처리 데이터 다운로드 (.csv)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreProcessor;
