/**
 * Single Level of Abstraction Principle (SLAP) - Correct Implementation
 *
 * The Single Level of Abstraction Principle states that code within a method or function
 * should be at the same level of abstraction. This means that high-level operations should
 * not be mixed with low-level details in the same method. Each method should either contain
 * high-level operations (calling other methods) or low-level operations (implementation details),
 * but not both.
 *
 * Benefits of SLAP:
 * 1. Improved code readability
 * 2. Better organization of code
 * 3. Easier maintenance and debugging
 * 4. Facilitates code reuse
 * 5. Simplifies testing
 *
 * In this example, we create a document processing system that follows SLAP by ensuring
 * each method operates at a single level of abstraction.
 */

// Document class with methods at consistent levels of abstraction
class Document {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.formattedContent = null;
    this.wordCount = 0;
    this.characterCount = 0;
    this.paragraphCount = 0;
  }

  // High-level method that calls other methods
  processDocument() {
    this.calculateStatistics();
    this.formatContent();
    this.generateSummary();
    return {
      title: this.title,
      statistics: this.getStatistics(),
      formattedContent: this.formattedContent,
      summary: this.summary
    };
  }

  // High-level method that calls specific calculation methods
  calculateStatistics() {
    this.countWords();
    this.countCharacters();
    this.countParagraphs();
  }

  // Low-level method focused on a single task
  countWords() {
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;
  }

  // Low-level method focused on a single task
  countCharacters() {
    this.characterCount = this.content.replace(/\s/g, '').length;
  }

  // Low-level method focused on a single task
  countParagraphs() {
    this.paragraphCount = this.content.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;
  }

  // Low-level method focused on a single task
  formatContent() {
    // Format the content with proper spacing and indentation
    const paragraphs = this.content.split(/\n\s*\n/);
    this.formattedContent = paragraphs
      .map(paragraph => {
        return paragraph.trim().replace(/\s+/g, ' ');
      })
      .join('\n\n');
  }

  // Low-level method focused on a single task
  generateSummary() {
    // Generate a simple summary (first 100 characters)
    this.summary = this.content.substring(0, 100) + (this.content.length > 100 ? '...' : '');
  }

  // Low-level method focused on a single task
  getStatistics() {
    return {
      wordCount: this.wordCount,
      characterCount: this.characterCount,
      paragraphCount: this.paragraphCount
    };
  }
}

// DocumentProcessor class with methods at consistent levels of abstraction
class DocumentProcessor {
  constructor() {
    this.documents = [];
  }

  // High-level method that calls other methods
  processDocuments(documentList) {
    const results = [];
    for (const docInfo of documentList) {
      const document = this.createDocument(docInfo.title, docInfo.content);
      const processedData = this.processDocument(document);
      results.push(processedData);
    }
    return results;
  }

  // Low-level method focused on a single task
  createDocument(title, content) {
    const document = new Document(title, content);
    this.documents.push(document);
    return document;
  }

  // Low-level method focused on a single task
  processDocument(document) {
    return document.processDocument();
  }

  // Low-level method focused on a single task
  getDocumentByTitle(title) {
    return this.documents.find(doc => doc.title === title);
  }

  // Low-level method focused on a single task
  getAllDocuments() {
    return [...this.documents];
  }
}

// Usage example
function demonstrateDocumentProcessor() {
  const processor = new DocumentProcessor();

  const documentList = [
    {
      title: "Introduction to JavaScript",
      content: "JavaScript is a programming language that conforms to the ECMAScript specification.\n\nIt is high-level, often just-in-time compiled, and multi-paradigm. It has curly-bracket syntax, dynamic typing, prototype-based object-orientation, and first-class functions."
    },
    {
      title: "Design Principles",
      content: "Software design principles are guidelines that help developers create software that is easy to maintain and extend.\n\nThey include principles like SOLID, DRY, KISS, and YAGNI. Following these principles leads to more maintainable and flexible code."
    }
  ];

  // Process all documents
  const processedDocuments = processor.processDocuments(documentList);

  // Display results
  console.log("Processed Documents:");
  processedDocuments.forEach(doc => {
    console.log(`\nTitle: ${doc.title}`);
    console.log(`Word Count: ${doc.statistics.wordCount}`);
    console.log(`Character Count: ${doc.statistics.characterCount}`);
    console.log(`Paragraph Count: ${doc.statistics.paragraphCount}`);
    console.log(`Summary: ${doc.summary}`);
    console.log(`Formatted Content:\n${doc.formattedContent}`);
  });
}

// Run the demonstration
demonstrateDocumentProcessor();

/**
 * This demonstrates good adherence to the Single Level of Abstraction Principle because:
 *
 * 1. Consistent Abstraction Levels:
 *    - High-level methods like 'processDocument' and 'processDocuments' only call other methods
 *    - Low-level methods like 'countWords' and 'formatContent' focus on specific implementation details
 *    - There's no mixing of high-level operations with low-level details in the same method
 *
 * 2. Clear Method Responsibilities:
 *    - Each method has a single, well-defined responsibility
 *    - Methods are named according to their level of abstraction and purpose
 *    - High-level methods orchestrate operations, while low-level methods implement specific tasks
 *
 * 3. Hierarchical Organization:
 *    - The code is organized in a hierarchical manner, with high-level methods at the top
 *      calling more specific methods below
 *    - This creates a natural flow from general to specific operations
 *
 * 4. Improved Readability:
 *    - Methods are short and focused, making them easier to understand
 *    - The level of abstraction within each method is consistent, reducing cognitive load
 *    - The code reads like a well-structured narrative, from high-level to low-level details
 *
 * 5. Enhanced Maintainability:
 *    - Changes to low-level implementation details don't affect high-level methods
 *    - New functionality can be added by creating new methods at the appropriate abstraction level
 *    - Testing is simplified because methods have clear inputs and outputs
 *
 * By following SLAP, this code is more readable, maintainable, and easier to extend.
 * Each method operates at a single level of abstraction, making the code more coherent
 * and reducing the cognitive load required to understand it.
 */