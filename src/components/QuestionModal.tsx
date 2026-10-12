import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, HelpCircle, Lightbulb, Sparkles, BookOpen } from 'lucide-react';
import { Question, QuestionType, MatchingPair } from '../types';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (questionData: Omit<Question, 'id'>) => void;
  initialQuestion?: Question | null;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialQuestion
}) => {
  const [type, setType] = useState<QuestionType>('multiple_choice');
  const [prompt, setPrompt] = useState('');
  const [options, setOptions] = useState<string[]>(['', '', '', '']);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [fillBlankAnswer, setFillBlankAnswer] = useState('');
  
  // Matching pairs
  const [matchingPairs, setMatchingPairs] = useState<MatchingPair[]>([
    { id: '1', left: '', right: '' },
    { id: '2', left: '', right: '' }
  ]);

  // Ordering items
  const [orderingItems, setOrderingItems] = useState<string[]>(['', '', '']);

  // Feedback fields
  const [explanation, setExplanation] = useState('');
  const [example, setExample] = useState('');
  const [memoryTip, setMemoryTip] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialQuestion) {
      setType(initialQuestion.type);
      setPrompt(initialQuestion.prompt);
      setExplanation(initialQuestion.explanation || '');
      setExample(initialQuestion.example || '');
      setMemoryTip(initialQuestion.memoryTip || '');

      if (initialQuestion.type === 'multiple_choice') {
        const opts = initialQuestion.options && initialQuestion.options.length >= 2 
          ? [...initialQuestion.options] 
          : ['', '', '', ''];
        while (opts.length < 4) opts.push('');
        setOptions(opts);
        const matchIdx = opts.findIndex(o => o.trim() === initialQuestion.correctAnswer.trim());
        setCorrectIndex(matchIdx >= 0 ? matchIdx : 0);
      } else if (initialQuestion.type === 'fill_blank') {
        setFillBlankAnswer(initialQuestion.correctAnswer);
      } else if (initialQuestion.type === 'matching' && initialQuestion.matchingPairs) {
        setMatchingPairs(initialQuestion.matchingPairs);
      } else if (initialQuestion.type === 'ordering' && initialQuestion.orderingItems) {
        setOrderingItems(initialQuestion.orderingItems);
      }
    } else {
      setType('multiple_choice');
      setPrompt('');
      setOptions(['', '', '', '']);
      setCorrectIndex(0);
      setFillBlankAnswer('');
      setMatchingPairs([
        { id: '1', left: '', right: '' },
        { id: '2', left: '', right: '' }
      ]);
      setOrderingItems(['', '', '']);
      setExplanation('');
      setExample('');
      setMemoryTip('');
    }
    setError(null);
  }, [initialQuestion, isOpen]);

  if (!isOpen) return null;

  const handleOptionChange = (idx: number, val: string) => {
    const updated = [...options];
    updated[idx] = val;
    setOptions(updated);
  };

  const handlePairChange = (idx: number, side: 'left' | 'right', val: string) => {
    const updated = [...matchingPairs];
    updated[idx][side] = val;
    setMatchingPairs(updated);
  };

  const handleAddPair = () => {
    setMatchingPairs([...matchingPairs, { id: `${Date.now()}`, left: '', right: '' }]);
  };

  const handleRemovePair = (idx: number) => {
    if (matchingPairs.length <= 2) return;
    setMatchingPairs(matchingPairs.filter((_, i) => i !== idx));
  };

  const handleOrderItemChange = (idx: number, val: string) => {
    const updated = [...orderingItems];
    updated[idx] = val;
    setOrderingItems(updated);
  };

  const handleAddOrderItem = () => {
    setOrderingItems([...orderingItems, '']);
  };

  const handleRemoveOrderItem = (idx: number) => {
    if (orderingItems.length <= 2) return;
    setOrderingItems(orderingItems.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi.');
      return;
    }

    let resolvedCorrectAnswer = '';
    let finalOptions: string[] | undefined = undefined;
    let finalPairs: MatchingPair[] | undefined = undefined;
    let finalOrdering: string[] | undefined = undefined;

    if (type === 'multiple_choice') {
      const validOptions = options.map(o => o.trim()).filter(Boolean);
      if (validOptions.length < 2) {
        setError('Câu hỏi trắc nghiệm cần ít nhất 2 lựa chọn đáp án.');
        return;
      }
      resolvedCorrectAnswer = options[correctIndex]?.trim() || validOptions[0];
      finalOptions = validOptions;
    } else if (type === 'fill_blank') {
      if (!fillBlankAnswer.trim()) {
        setError('Vui lòng nhập từ/cụm từ đáp án đúng cần điền.');
        return;
      }
      resolvedCorrectAnswer = fillBlankAnswer.trim();
      finalOptions = [resolvedCorrectAnswer];
    } else if (type === 'matching') {
      const validPairs = matchingPairs.filter(p => p.left.trim() && p.right.trim());
      if (validPairs.length < 2) {
        setError('Cần ít nhất 2 cặp khái niệm - định nghĩa để nối.');
        return;
      }
      finalPairs = validPairs;
      resolvedCorrectAnswer = validPairs.map(p => `${p.left} -> ${p.right}`).join('; ');
    } else if (type === 'ordering') {
      const validItems = orderingItems.map(item => item.trim()).filter(Boolean);
      if (validItems.length < 2) {
        setError('Cần ít nhất 2 bước/mục để sắp xếp thứ tự.');
        return;
      }
      finalOrdering = validItems;
      resolvedCorrectAnswer = validItems.join(' -> ');
    }

    onSave({
      type,
      prompt: prompt.trim(),
      options: finalOptions,
      correctAnswer: resolvedCorrectAnswer,
      matchingPairs: finalPairs,
      orderingItems: finalOrdering,
      explanation: explanation.trim() || `Đáp án chính xác: ${resolvedCorrectAnswer}`,
      example: example.trim(),
      memoryTip: memoryTip.trim()
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F1F28]/35 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        style={{
          boxShadow: '0 24px 60px rgba(91, 45, 255, 0.12), 0 4px 16px rgba(0, 0, 0, 0.04)',
        }}
        className="bg-white rounded-3xl border border-black/[0.06] w-full max-w-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-black/[0.05] flex items-center justify-between bg-[#FCFAF6]">
          <div className="flex items-center gap-3">
            <div
              style={{ boxShadow: '0 6px 16px rgba(91, 45, 255, 0.25)' }}
              className="w-9 h-9 rounded-2xl bg-[#5B2DFF] text-white flex items-center justify-center shrink-0"
            >
              <Sparkles className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-flow-serif text-lg font-normal text-[#1F1F28]">
                {initialQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới vào bộ thẻ'}
              </h3>
              <p className="text-[11px] text-[#8E8E93]">
                Soạn thảo câu hỏi kèm giải thích, ví dụ thực tế và mẹo nhớ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white hover:bg-black/5 text-[#8E8E93] hover:text-[#1F1F28] flex items-center justify-center transition-colors cursor-pointer border border-black/[0.05]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl font-medium">
                {error}
              </div>
            )}

            {/* Dạng câu hỏi selector (Lilac Flow Pill Segmented Tabs) */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#8E8E93] mb-2">
                Dạng câu hỏi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setType('multiple_choice')}
                  style={type === 'multiple_choice' ? { backgroundColor: '#5B2DFF', color: '#fff', boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)' } : {}}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    type === 'multiple_choice'
                      ? 'border-[#5B2DFF] font-semibold'
                      : 'border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-[#8E8E93] hover:text-[#1F1F28]'
                  }`}
                >
                  Trắc nghiệm 4 đáp án
                </button>
                <button
                  type="button"
                  onClick={() => setType('fill_blank')}
                  style={type === 'fill_blank' ? { backgroundColor: '#5B2DFF', color: '#fff', boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)' } : {}}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    type === 'fill_blank'
                      ? 'border-[#5B2DFF] font-semibold'
                      : 'border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-[#8E8E93] hover:text-[#1F1F28]'
                  }`}
                >
                  Điền từ chỗ trống
                </button>
                <button
                  type="button"
                  onClick={() => setType('matching')}
                  style={type === 'matching' ? { backgroundColor: '#5B2DFF', color: '#fff', boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)' } : {}}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    type === 'matching'
                      ? 'border-[#5B2DFF] font-semibold'
                      : 'border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-[#8E8E93] hover:text-[#1F1F28]'
                  }`}
                >
                  Nối khái niệm
                </button>
                <button
                  type="button"
                  onClick={() => setType('ordering')}
                  style={type === 'ordering' ? { backgroundColor: '#5B2DFF', color: '#fff', boxShadow: '0 4px 14px rgba(91, 45, 255, 0.35)' } : {}}
                  className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                    type === 'ordering'
                      ? 'border-[#5B2DFF] font-semibold'
                      : 'border-black/[0.06] bg-[#FCFAF6] hover:bg-[#F3EFE6] text-[#8E8E93] hover:text-[#1F1F28]'
                  }`}
                >
                  Sắp xếp thứ tự
                </button>
              </div>
            </div>

            {/* Đề bài / Câu hỏi */}
            <div>
              <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
                Nội dung câu hỏi / Đề bài *
              </label>
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Trong kinh tế học, lạm phát được định nghĩa là gì?"
                className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
              />
            </div>

            {/* Cấu hình các lựa chọn tùy theo dạng câu hỏi */}
            {type === 'multiple_choice' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1F1F28]">
                    4 Lựa chọn (Chọn nút tròn để chỉ định đáp án đúng)
                  </label>
                  <span className="text-[11px] text-[#5B2DFF] font-medium">
                    Đáp án đúng: Lựa chọn {String.fromCharCode(65 + correctIndex)}
                  </span>
                </div>

                <div className="space-y-2">
                  {options.map((opt, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 p-2.5 rounded-2xl border transition-all ${
                        correctIndex === idx
                          ? 'border-[#5B2DFF] bg-[#EDE8FF]/40 ring-1 ring-[#5B2DFF]'
                          : 'border-black/[0.06] bg-[#FCFAF6]'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(idx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer transition-colors ${
                          correctIndex === idx
                            ? 'bg-[#5B2DFF] text-white shadow-xs'
                            : 'bg-white text-[#8E8E93] border border-black/[0.08]'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>

                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`}
                        className="w-full bg-transparent text-xs text-[#1F1F28] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {type === 'fill_blank' && (
              <div>
                <label className="block text-xs font-semibold text-[#1F1F28] mb-1.5">
                  Từ / Cụm từ đáp án chính xác *
                </label>
                <input
                  type="text"
                  value={fillBlankAnswer}
                  onChange={(e) => setFillBlankAnswer(e.target.value)}
                  placeholder="Nhập từ hoặc cụm từ cần điền chuẩn xác..."
                  className="w-full px-4 py-2.5 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
                />
              </div>
            )}

            {type === 'matching' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1F1F28]">
                    Các cặp khái niệm &amp; định nghĩa tương ứng
                  </label>
                  <button
                    type="button"
                    onClick={handleAddPair}
                    className="text-xs text-[#5B2DFF] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm cặp</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {matchingPairs.map((pair, idx) => (
                    <div key={pair.id || idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={pair.left}
                        onChange={(e) => handlePairChange(idx, 'left', e.target.value)}
                        placeholder="Thuật ngữ / Vế trái"
                        className="w-1/2 px-3.5 py-2 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-xl focus:outline-none focus:border-[#5B2DFF]"
                      />
                      <span className="text-[#8E8E93]">&rarr;</span>
                      <input
                        type="text"
                        value={pair.right}
                        onChange={(e) => handlePairChange(idx, 'right', e.target.value)}
                        placeholder="Định nghĩa / Vế phải"
                        className="w-1/2 px-3.5 py-2 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-xl focus:outline-none focus:border-[#5B2DFF]"
                      />
                      {matchingPairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemovePair(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {type === 'ordering' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-[#1F1F28]">
                    Danh sách các bước theo thứ tự chuẩn
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOrderItem}
                    className="text-xs text-[#5B2DFF] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm bước</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {orderingItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#EDE8FF] text-[#5B2DFF] font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <input
                        type="text"
                        value={item}
                        onChange={(e) => handleOrderItemChange(idx, e.target.value)}
                        placeholder={`Nội dung bước thứ ${idx + 1}`}
                        className="w-full px-3.5 py-2 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-xl focus:outline-none focus:border-[#5B2DFF]"
                      />
                      {orderingItems.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOrderItem(idx)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* BỘ BA PHẢN HỒI (FEEDBACK FIELDS) */}
            <div className="pt-3 border-t border-black/[0.05] space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8E8E93] block">
                Phản hồi giải thích chi tiết (Hiển thị sau khi người học trả lời)
              </span>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F1F28] mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#5B2DFF]" />
                  <span>Giải thích lý do đúng / sai</span>
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Giải thích vì sao đáp án này là đúng..."
                  className="w-full px-4 py-2 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F1F28] mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-[#8E8E93]" />
                    <span>Ví dụ minh họa thực tế</span>
                  </label>
                  <input
                    type="text"
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="VD câu văn mẫu, tình huống ứng dụng..."
                    className="w-full px-4 py-2 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-[#1F1F28] mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mẹo ghi nhớ nhanh (Mnemonic)</span>
                  </label>
                  <input
                    type="text"
                    value={memoryTip}
                    onChange={(e) => setMemoryTip(e.target.value)}
                    placeholder="VD: Từ ghép, liên tưởng hình ảnh..."
                    className="w-full px-4 py-2 text-xs bg-[#FCFAF6] border border-black/[0.08] rounded-2xl focus:outline-none focus:border-[#5B2DFF] focus:ring-2 focus:ring-[#5B2DFF]/20"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="px-6 py-4 border-t border-black/[0.05] flex items-center justify-end gap-3 bg-[#FCFAF6]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-xs font-medium text-[#1F1F28] bg-white hover:bg-[#F3EFE6] border border-black/[0.06] rounded-full transition-all cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              style={{
                backgroundColor: '#5B2DFF',
                boxShadow: '0 8px 20px rgba(91, 45, 255, 0.35)',
              }}
              className="px-6 py-2.5 text-xs font-semibold text-white rounded-full hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {initialQuestion ? 'Cập nhật câu hỏi' : 'Lưu câu hỏi mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
