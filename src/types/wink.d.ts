declare module 'wink-tokenizer' {
  interface Token {
    value: string;
    tag: string;
    normal?: string;
  }

  class Tokenizer {
    constructor();
    tokenize(text: string): Token[];
  }

  export default Tokenizer;
}

declare module 'wink-porter2-stemmer' {
  function stem(word: string): string;
  export default stem;
} 