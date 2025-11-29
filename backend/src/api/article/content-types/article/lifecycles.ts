export default {
  async beforeCreate(event) {
    const { data } = event.params;
    if (data.content) {
      data.readingTime = calculateReadingTime(data.content);
    }
  },

  async beforeUpdate(event) {
    const { data } = event.params;
    if (data.content) {
      data.readingTime = calculateReadingTime(data.content);
    }
  }
};

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}