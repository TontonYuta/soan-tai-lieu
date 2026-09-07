export interface AiModelConfig {
  id: string;
  name: string;
  badge?: string;
  desc: string;
  urlModifier?: string;
}

export interface AiProviderConfig {
  id: string;
  name: string;
  fullName: string;
  url: string;
  icon: string;
  bg: string;
  models: AiModelConfig[];
}

export const AI_PROVIDERS: AiProviderConfig[] = [
  {
    id: 'antigravity',
    name: 'Antigravity',
    fullName: 'Antigravity Local Engine (Google)',
    url: 'local://antigravity-agent',
    icon: '🚀',
    bg: 'bg-[#FF5757]',
    models: [
      { id: 'gemini-3.8-flash-high', name: 'Gemini 3.8 Flash (High Reasoning)', badge: 'Khuyên Dùng', desc: 'Mô hình mặc định siêu tốc của Antigravity Agent, tư duy logic cao, tối ưu code Manim' },
      { id: 'gemini-3.1-pro-high', name: 'Gemini 3.1 Pro (High Reasoning)', badge: 'Sâu Tắc & Logic', desc: 'Mô hình Pro chuyên giải các bài toán đại số, tích phân & hình học phức tạp' },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6 (Thinking)', badge: 'Vô Địch Code', desc: 'Mô hình Claude Sonnet với khả năng lập trình & thiết kế Visual Engineering đỉnh cao' },
      { id: 'gpt-oss-120b-medium', name: 'GPT-OSS 120B (Medium)', badge: 'Mã Nguồn Mở', desc: 'Mô hình mã nguồn mở 120B tham số mạnh mẽ cho bài giảng STEM' },
      { id: 'gemini-3.7-flash-high', name: 'Gemini 3.7 Flash (High)', badge: 'Cân Bằng', desc: 'Mô hình 3.7 Flash phản hồi siêu tốc, chính xác cao' },
    ]
  },
  {
    id: 'gemini',
    name: 'Gemini',
    fullName: 'Google Gemini',
    url: 'https://gemini.google.com/app',
    icon: '✨',
    bg: 'bg-[#00CECB]',
    models: [
      { id: 'gemini-3.1-pro', name: 'Gemini 3.1 Pro', badge: 'Khuyên Dùng', desc: 'Mạnh nhất về logic, suy luận sâu & code Manim hoàn hảo' },
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash', badge: 'Mới & Nhanh', desc: 'Thế hệ Flash mới nhất, tốc độ phản hồi cực nhanh, chính xác cao' },
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash Lite', badge: 'Siêu Nhẹ', desc: 'Mô hình gọn nhẹ, tối ưu hóa tốc độ phản hồi tức thì' },
    ]
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT',
    fullName: 'ChatGPT (OpenAI)',
    url: 'https://chatgpt.com',
    icon: '🟢',
    bg: 'bg-[#A3E635]',
    models: [
      { id: 'chatgpt-think', name: 'Bật Think (Suy nghĩ sâu)', badge: 'Khuyên Dùng', desc: 'Bật chế độ Reason/Think trên ChatGPT để giải toán STEM & lập trình Manim chuẩn xác', urlModifier: 'https://chatgpt.com' },
      { id: 'chatgpt-no-think', name: 'Tắt Think (Tiêu chuẩn)', badge: 'Nhanh', desc: 'Tắt chế độ Think, phản hồi trực tiếp với tốc độ nhanh nhất', urlModifier: 'https://chatgpt.com' },
    ]
  },
  {
    id: 'claude',
    name: 'Claude',
    fullName: 'Claude (Anthropic)',
    url: 'https://claude.ai/new',
    icon: '🟣',
    bg: 'bg-[#FF90E8]',
    models: [
      { id: 'claude-3-7-sonnet', name: 'Claude 3.7 Sonnet', badge: 'Vô Địch Code', desc: 'Hybrid reasoning lập trình số 1 hiện nay', urlModifier: 'https://claude.ai/new?model=claude-3-7-sonnet' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', badge: 'Chuẩn Mực', desc: 'Code Manim cực kỳ sạch, sư phạm và chặt chẽ', urlModifier: 'https://claude.ai/new' },
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', badge: 'Nhanh Nhẹ', desc: 'Tốc độ phản hồi tức thì cho phân cảnh ngắn', urlModifier: 'https://claude.ai/new' },
    ]
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    fullName: 'DeepSeek AI',
    url: 'https://chat.deepseek.com',
    icon: '🔵',
    bg: 'bg-[#60A5FA]',
    models: [
      { id: 'deepseek-r1', name: 'DeepSeek-R1 (DeepThink)', badge: 'DeepThink R1', desc: 'Tư duy reasoning toán học mã nguồn mở số 1 thế giới', urlModifier: 'https://chat.deepseek.com' },
      { id: 'deepseek-v3', name: 'DeepSeek-V3', badge: 'Siêu Tốc', desc: 'Tổng quát siêu tốc, bóc tách code mượt mà', urlModifier: 'https://chat.deepseek.com' },
    ]
  },
  {
    id: 'grok',
    name: 'Grok',
    fullName: 'xAI Grok',
    url: 'https://grok.com',
    icon: '⚡',
    bg: 'bg-[#FFED66]',
    models: [
      { id: 'grok-3', name: 'Grok 3 (Think Mode)', badge: 'Mới Nhất', desc: 'Siêu mô hình thế hệ mới của xAI với khả năng suy luận mở rộng', urlModifier: 'https://grok.com' },
      { id: 'grok-2', name: 'Grok 2', desc: 'Mô hình thế hệ 2 của xAI', urlModifier: 'https://grok.com' },
    ]
  }
];

export const isUrlBelongsToProvider = (url: string, providerId: string): boolean => {
  const lower = url.toLowerCase();
  switch (providerId) {
    case 'antigravity':
      return true;
    case 'chatgpt':
      return lower.includes('chatgpt.com') || lower.includes('openai.com');
    case 'gemini':
      return lower.includes('gemini.google.com');
    case 'claude':
      return lower.includes('claude.ai');
    case 'deepseek':
      return lower.includes('deepseek.com');
    case 'grok':
      return lower.includes('grok.com') || lower.includes('x.com');
    default:
      return true;
  }
};

export const getProviderUrl = (providerId: string, modelId?: string): string => {
  const provider = AI_PROVIDERS.find(p => p.id === providerId) || AI_PROVIDERS[0];
  if (modelId) {
    const m = provider.models.find(x => x.id === modelId);
    if (m?.urlModifier) return m.urlModifier;
  }
  const customSaved = localStorage.getItem(`yuta_ai_url_${providerId}`);
  if (customSaved && isUrlBelongsToProvider(customSaved, providerId)) {
    return customSaved;
  }
  return provider.url;
};
