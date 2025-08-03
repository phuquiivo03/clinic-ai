export type FewShotItem = {
  label: string;
  mimeType: string;
  data: string;
};

export type GeminiHistory = {
  role: 'user' | 'model';
  parts: { inlineData?: { mimeType: string; data: string }; text?: string }[];
};
