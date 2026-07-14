export const extractCodeblocks = (text: string) => {
  const regex = /```([\w-]*)\n([\s\S]*?)```/g;
  const results: { language: string | null; code: string }[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    results.push({
      language: match[1] || null,
      code: match[2].trim(),
    });
  }
  return results;
};
