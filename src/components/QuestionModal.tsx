import React, { useState, useEffect } from 'react';
import { X, Check, Plus, Trash2, HelpCircle, Lightbulb, Sparkles } from 'lucide-react';
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

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!prompt.trim()) {
      setError('Vui lòng nhập nội dung câu hỏi / đề bài.');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {initialQuestion ? 'Chỉnh sửa câu hỏi' : 'Thêm câu hỏi mới vào bộ thẻ'}
            </h3>
            <p className="text-xs text-slate-500">
              Soạn thảo câu hỏi kèm giải thích, ví dụ thực tế và mẹo nhớ
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave}>
          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Dạng câu hỏi selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Dạng câu hỏi
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => setType('multiple_choice')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    type === 'multiple_choice'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Trắc nghiệm 4 đáp án
                </button>
                <button
                  type="button"
                  onClick={() => setType('fill_blank')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    type === 'fill_blank'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Điền từ chỗ trống
                </button>
                <button
                  type="button"
                  onClick={() => setType('matching')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    type === 'matching'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Nối khái niệm
                </button>
                <button
                  type="button"
                  onClick={() => setType('ordering')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    type === 'ordering'
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700 font-bold shadow-2xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Sắp xếp thứ tự
                </button>
              </div>
            </div>

            {/* Đề bài / Câu hỏi */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1">
                Nội dung câu hỏi / Đề bài *
              </label>
              <textarea
                rows={2}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="VD: Trong kinh tế học, lạm phát được định nghĩa là gì?"
                className="w-full px-3.5 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Cấu hình các lựa chọn tùy theo dạng câu hỏi */}
            {type === 'multiple_choice' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Các lựa chọn đáp án (Chọn radio làm đáp án đúng) *
                  </label>
                  <span className="text-[11px] text-slate-400">Tối thiểu 2 lựa chọn</span>
                </div>

                {options.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isChecked = correctIndex === idx;
                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-2.5 p-2 rounded-xl border transition-colors ${
                        isChecked
                          ? 'border-emerald-500 bg-emerald-50/40'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setCorrectIndex(idx)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                          isChecked
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                        title="Đặt làm đáp án đúng"
                      >
                        {isChecked ? <Check className="w-3.5 h-3.5" /> : letters[idx]}
                      </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(idx, e.target.value)}
                        placeholder={`Lựa chọn ${letters[idx]}...`}
                        className="w-full text-xs bg-transparent focus:outline-none text-slate-800 font-medium placeholder:text-slate-400"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {type === 'fill_blank' && (
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Đáp án từ/cụm từ chính xác cần điền *
                </label>
                <input
                  type="text"
                  value={fillBlankAnswer}
                  onChange={(e) => setFillBlankAnswer(e.target.value)}
                  placeholder="VD: mitigate"
                  className="w-full px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Người học sẽ tự gõ từ này hoặc chọn từ các gợi ý khi làm bài kiểm tra.
                </p>
              </div>
            )}

            {type === 'matching' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Các cặp khái niệm &amp; định nghĩa cần nối *
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setMatchingPairs([
                        ...matchingPairs,
                        { id: String(Date.now()), left: '', right: '' }
                      ])
                    }
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm cặp
                  </button>
                </div>

                {matchingPairs.map((pair, idx) => (
                  <div key={pair.id} className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl relative group">
                    <input
                      type="text"
                      placeholder={`Khái niệm / Thuật ngữ ${idx + 1}`}
                      value={pair.left}
                      onChange={(e) => {
                        const updated = [...matchingPairs];
                        updated[idx].left = e.target.value;
                        setMatchingPairs(updated);
                      }}
                      className="text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                    />
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        placeholder={`Định nghĩa / Ý nghĩa ${idx + 1}`}
                        value={pair.right}
                        onChange={(e) => {
                          const updated = [...matchingPairs];
                          updated[idx].right = e.target.value;
                          setMatchingPairs(updated);
                        }}
                        className="w-full text-xs px-3 py-1.5 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                      {matchingPairs.length > 2 && (
                        <button
                          type="button"
                          onClick={() => setMatchingPairs(matchingPairs.filter((_, i) => i !== idx))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {type === 'ordering' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-800">
                    Thứ tự đúng từ bước đầu tiên đến bước cuối cùng *
                  </label>
                  <button
                    type="button"
                    onClick={() => setOrderingItems([...orderingItems, ''])}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm bước
                  </button>
                </div>

                {orderingItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const updated = [...orderingItems];
                        updated[idx] = e.target.value;
                        setOrderingItems(updated);
                      }}
                      placeholder={`Bước / Sự kiện ${idx + 1}...`}
                      className="w-full text-xs px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    {orderingItems.length > 2 && (
                      <button
                        type="button"
                        onClick={() => setOrderingItems(orderingItems.filter((_, i) => i !== idx))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Phản hồi chi tiết (Feedback Loop Core) */}
            <div className="border-t border-slate-200 pt-4 space-y-3.5">
              <div className="flex items-center gap-2 text-xs font-bold text-indigo-900 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Nội dung phản hồi sau khi trả lời (Feedback Card)</span>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  Lý do &amp; Giải thích chi tiết *
                </label>
                <textarea
                  rows={2}
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Giải thích tại sao đáp án này đúng, bản chất kiến thức..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                    <span>Ví dụ minh họa thực tế</span>
                  </label>
                  <textarea
                    rows={2}
                    value={example}
                    onChange={(e) => setExample(e.target.value)}
                    placeholder="VD: Khi thu nhập tăng, sinh viên ít ăn mì tôm hơn..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mb-1">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mẹo ghi nhớ (Mnemonic)</span>
                  </label>
                  <textarea
                    rows={2}
                    value={memoryTip}
                    onChange={(e) => setMemoryTip(e.target.value)}
                    placeholder="VD: Khả nghịch = Khác không (Khả - Khác)..."
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-xs transition-colors"
            >
              {initialQuestion ? 'Lưu thay đổi' : 'Thêm vào bộ thẻ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
