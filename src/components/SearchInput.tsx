'use client';

import { Ref } from 'react';

interface SearchInputProps {
  ref?: Ref<HTMLInputElement>;
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClear?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  showClearButton?: boolean;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

/**
 * 再利用可能な検索入力コンポーネント
 * アクセシビリティ対応とカスタマイズ性を重視
 */
function SearchInput({
  ref,
  value,
  onChange,
  onFocus,
  onBlur,
  onClear,
  placeholder = "検索キーワードを入力...",
  isLoading = false,
  showClearButton = true,
  disabled = false,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}: SearchInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleClear = () => {
    onChange('');
    onClear?.();
  };

  const hasValue = value.trim().length > 0;

  return (
    <div className={`relative ${className}`}>
      {/* 検索アイコン */}
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg 
          className="h-5 w-5 text-gray-400" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
          />
        </svg>
      </div>

      {/* 検索入力フィールド */}
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          search-input pl-10 pr-12 py-3 text-base
          ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}
        `}
        aria-label={ariaLabel || placeholder}
        aria-describedby={ariaDescribedBy}
        autoComplete="off"
        spellCheck="false"
        {...props}
      />

      {/* 右側のボタン群（ローディング・クリア） */}
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        {isLoading ? (
          <LoadingSpinner />
        ) : hasValue && showClearButton && !disabled ? (
          <ClearButton onClick={handleClear} />
        ) : null}
      </div>
    </div>
  );
}

/**
 * ローディングスピナーコンポーネント
 */
function LoadingSpinner() {
  return (
    <svg 
      className="animate-spin h-5 w-5 text-orange-500" 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/**
 * クリアボタンコンポーネント
 */
interface ClearButtonProps {
  onClick: () => void;
}

function ClearButton({ onClick }: ClearButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
      aria-label="検索をクリア"
    >
      <svg 
        className="h-5 w-5" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M6 18L18 6M6 6l12 12" 
        />
      </svg>
    </button>
  );
}

export default SearchInput;

/**
 * 楽曲検索専用の拡張SearchInputコンポーネント
 */
interface SongSearchInputProps extends Omit<SearchInputProps, 'placeholder' | 'aria-label'> {
  placeholder?: string;
}

export function SongSearchInput({ 
  placeholder = "替え歌の歌詞、原曲のタイトル・アーティストで検索...",
  ...props 
}: SongSearchInputProps) {
  return (
    <SearchInput
      placeholder={placeholder}
      aria-label="楽曲検索"
      {...props}
    />
  );
}

/**
 * ライブ検索（リアルタイム検索）用のSearchInputコンポーネント
 */
interface LiveSearchInputProps extends SearchInputProps {
  debounceMs?: number;
  onLiveSearch?: (query: string) => void;
}

export function LiveSearchInput({ 
  debounceMs = 300,
  onLiveSearch,
  onChange,
  ...props 
}: LiveSearchInputProps) {
  // デバウンス処理はSearchBarで実装済みのため、ここでは基本的なSearchInputを返す
  // 将来的にデバウンス処理をここに移動することも可能
  return (
    <SearchInput
      onChange={onChange}
      {...props}
    />
  );
}