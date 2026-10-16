import React, { useState } from 'react';
import { X, Copy, Check, Database, ExternalLink, Terminal, AlertTriangle, RefreshCw } from 'lucide-react';
import { SUPABASE_SQL_SCHEMA } from '../lib/supabase';

interface DatabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRetrySync: () => Promise<void>;
  errorMessage?: string | null;
}

export const DatabaseSetupModal: React.FC<DatabaseSetupModalProps> = ({
  isOpen,
  onClose,
  onRetrySync,
  errorMessage
}) => {
  const [copied, setCopied] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retrySuccess, setRetrySuccess] = useState<boolean | null>(null);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA.trim());
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = SUPABASE_SQL_SCHEMA.trim();
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetrySuccess(null);
    try {
      await onRetrySync();
      setRetrySuccess(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch {
      setRetrySuccess(false);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-[#FCFAF6] rounded-3xl border border-black/[0.08] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        style={{
          boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.06] bg-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center border border-amber-500/20">
              <Database className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#1F1F28] font-flow-serif">
                Khởi tạo Cấu trúc Bảng Supabase
              </h2>
              <p className="text-xs text-[#8E8E93]">
                Khắc phục lỗi thiếu bảng <code className="bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono text-[11px]">public.courses</code> để đồng bộ dữ liệu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#8E8E93] hover:text-[#1F1F28] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Reason explanation banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed space-y-1">
              <p className="font-semibold text-amber-950 text-sm">
                Tại sao lại hiện thông báo "Could not find the table 'public.courses'"?
              </p>
              <p>
                Dự án Supabase của bạn đã kết nối thành công, nhưng cơ sở dữ liệu trên Cloud <strong>chưa được tạo các bảng dữ liệu</strong> (<code>courses</code>, <code>study_sets</code>, <code>user_stats</code>).
              </p>
              {errorMessage && (
                <p className="font-mono bg-amber-100/70 p-1.5 rounded text-[11px] text-amber-800 break-all mt-1">
                  Chi tiết lỗi: {errorMessage}
                </p>
              )}
            </div>
          </div>

          {/* 3 Step Guide */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#8E8E93] mb-3">
              Hướng dẫn thực hiện trong 30 giây:
            </h3>
            <ol className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <li className="p-3.5 bg-white rounded-2xl border border-black/[0.06] flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-[#5B2DFF]/10 text-[#5B2DFF] font-bold rounded-md mb-1.5">
                    Bước 1
                  </span>
                  <p className="font-semibold text-[#1F1F28] mb-1">Mở Supabase SQL Editor</p>
                  <p className="text-[#8E8E93] leading-relaxed">
                    Vào trang quản trị Supabase của bạn, chọn tab <strong>SQL Editor</strong> ở cột trái.
                  </p>
                </div>
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#5B2DFF] hover:underline"
                >
                  <span>Mở Supabase</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </li>

              <li className="p-3.5 bg-white rounded-2xl border border-black/[0.06] flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-[#5B2DFF]/10 text-[#5B2DFF] font-bold rounded-md mb-1.5">
                    Bước 2
                  </span>
                  <p className="font-semibold text-[#1F1F28] mb-1">Sao chép & Chạy mã SQL</p>
                  <p className="text-[#8E8E93] leading-relaxed">
                    Bấm nút <strong>Sao chép SQL</strong> bên dưới, dán vào ô SQL Editor và nhấn <strong>Run</strong> (Chạy).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#5B2DFF] hover:underline cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Đã sao chép!' : 'Sao chép ngay'}</span>
                </button>
              </li>

              <li className="p-3.5 bg-white rounded-2xl border border-black/[0.06] flex flex-col justify-between">
                <div>
                  <span className="inline-block px-2 py-0.5 bg-[#5B2DFF]/10 text-[#5B2DFF] font-bold rounded-md mb-1.5">
                    Bước 3
                  </span>
                  <p className="font-semibold text-[#1F1F28] mb-1">Thử lại & Đồng bộ</p>
                  <p className="text-[#8E8E93] leading-relaxed">
                    Sau khi chạy SQL thành công, bấm nút <strong>"Thử đồng bộ lại"</strong> bên dưới. Cảnh báo sẽ tự động tắt.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isRetrying}
                  className="mt-3 inline-flex items-center gap-1 text-[11px] font-medium text-[#5B2DFF] hover:underline cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isRetrying ? 'animate-spin' : ''}`} />
                  <span>{isRetrying ? 'Đang kiểm tra...' : 'Thử lại ngay'}</span>
                </button>
              </li>
            </ol>
          </div>

          {/* SQL Code Block with Copy Button */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#8E8E93]" />
                <span className="text-xs font-semibold text-[#1F1F28]">Mã SQL khởi tạo toàn bộ bảng & RLS:</span>
              </div>
              <button
                type="button"
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#5B2DFF] text-white text-xs font-medium hover:bg-[#4a22d9] transition shadow-sm cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Đã sao chép thành công!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép toàn bộ SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="relative rounded-2xl bg-[#191924] border border-black/20 overflow-hidden shadow-inner">
              <pre className="p-4 text-xs font-mono text-[#E4E4EB] overflow-x-auto max-h-60 leading-relaxed scrollbar-thin scrollbar-thumb-white/20">
                <code>{SUPABASE_SQL_SCHEMA.trim()}</code>
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-black/[0.06] bg-white flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-[#8E8E93]">
            {retrySuccess === true && (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <Check className="w-4 h-4" /> Đồng bộ thành công! Đang đóng cửa sổ...
              </span>
            )}
            {retrySuccess === false && (
              <span className="text-rose-600 font-medium flex items-center gap-1">
                <AlertTriangle className="w-4 h-4" /> Vẫn chưa thấy bảng courses. Hãy chắc chắn bạn đã bấm "Run" trên Supabase SQL Editor.
              </span>
            )}
            {retrySuccess === null && (
              <span>Lệnh <code className="font-mono text-black font-semibold">NOTIFY pgrst, 'reload schema';</code> ở cuối script sẽ tự động làm mới bộ nhớ đệm.</span>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#8E8E93] hover:text-[#1F1F28] hover:bg-black/5 transition cursor-pointer"
            >
              Đóng (Tiếp tục Offline)
            </button>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#5B2DFF] hover:bg-[#4a22d9] transition shadow-sm cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
              <span>{isRetrying ? 'Đang kiểm tra kết nối...' : 'Đã tạo bảng & Thử lại ngay'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
