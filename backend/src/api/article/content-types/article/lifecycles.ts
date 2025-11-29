interface BlocksTextChild {
  text: string;
  type?: string;
}

interface BlocksNode {
  type: string;
  children?: BlocksTextChild[];
}

const extractTextFromBlocks = (blocks: BlocksNode[]): string => {
  if (!blocks || !Array.isArray(blocks)) return '';
  
  let text = '';
  
  blocks.forEach(block => {
    if (block.children && Array.isArray(block.children)) {
      block.children.forEach(child => {
        if (child.text && typeof child.text === 'string') {
          text += child.text + ' ';
        }
      });
    }
  });
  
  return text.trim();
};


const calculateReadingTime = (content: any): number => {
  if (!content) return 5; 
  
  let text = '';
  
  if (Array.isArray(content)) {
    text = extractTextFromBlocks(content);
  } 
  else if (typeof content === 'string') {
    text = content;
  }
  
  const wordsPerMinute = 200;
  const wordCount = text.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  
  return Math.max(1, readingTime); 
};

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (data.content) {
      data.readingTime = calculateReadingTime(data.content);
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    if (data.content) {
      data.readingTime = calculateReadingTime(data.content);
    }
  }
};