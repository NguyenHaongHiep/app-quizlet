/**
 * Hỗ trợ phát âm từ vựng / thuật ngữ bằng Web Speech API
 */

export function speakText(text: string, lang: 'en' | 'vi' = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    // Dừng âm thanh trước nếu đang phát
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Tự động nhận diện ngôn ngữ nếu không chỉ định rõ
    // Nếu chứa nhiều ký tự tiếng Việt có dấu -> chọn vi-VN, ngược lại en-US
    const hasVietnamese = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text);
    const targetLang = lang === 'vi' || hasVietnamese ? 'vi-VN' : 'en-US';
    
    utterance.lang = targetLang;
    utterance.rate = 0.95; // Tốc độ chuẩn cho học tập
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.error('Không thể phát âm thanh:', err);
  }
}
