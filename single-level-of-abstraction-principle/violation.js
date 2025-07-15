/**
 * Single Level of Abstraction Principle (SLAP) - Violation
 *
 * The Single Level of Abstraction Principle states that code within a method or function
 * should be at the same level of abstraction. This means that high-level operations should
 * not be mixed with low-level details in the same method.
 *
 * This file demonstrates a violation of the Single Level of Abstraction Principle by
 * mixing different levels of abstraction within the same methods, making the code harder
 * to read, understand, and maintain.
 */

// Document class with methods that mix different levels of abstraction
class Document {
  constructor(title, content) {
    this.title = title;
    this.content = content;
    this.formattedContent = null;
    this.wordCount = 0;
    this.characterCount = 0;
    this.paragraphCount = 0;
    this.summary = null;
  }

  // Violates SLAP by mixing high-level operations with low-level implementation details
  processDocument() {
    // Calculate word count (low-level implementation detail)
    this.wordCount = this.content.split(/\s+/).filter(word => word.length > 0).length;

    // Calculate character count (low-level implementation detail)
    this.characterCount = this.content.replace(/\s/g, '').length;

    // Calculate paragraph count (low-level implementation detail)
    this.paragraphCount = this.content.split(/\n\s*\n/).filter(para => para.trim().length > 0).length;

    // Format content (low-level implementation detail)
    const paragraphs = this.content.split(/\n\s*\n/);
    this.formattedContent = paragraphs
      .map(paragraph => {
        return paragraph.trim().replace(/\s+/g, ' ');
      })
      .join('\n\n');

    // Generate summary (low-level implementation detail)
    this.summary = this.content.substring(0, 100) + (this.content.length > 100 ? '...' : '');

    // Return processed data (high-level operation)
    return {
      title: this.title,
      statistics: {
        wordCount: this.wordCount,
        characterCount: this.characterCount,
        paragraphCount: this.paragraphCount
      },
      formattedContent: this.formattedContent,
      summary: this.summary
    };
  }
}

// DocumentProcessor class with methods that mix different levels of abstraction
class DocumentProcessor {
  constructor() {
    this.documents = [];
  }

  // Violates SLAP by mixing high-level operations with low-level implementation details
  processDocuments(documentList) {
    const results = [];

    for (const docInfo of documentList) {
      // Create document (low-level implementation detail)
      const document = new Document(docInfo.title, docInfo.content);
      this.documents.push(document);

      // Process document (mix of high-level operation and low-level details)
      const processedData = document.processDocument();

      // Add to results (low-level implementation detail)
      results.push(processedData);

      // Log processing (unrelated low-level detail)
      console.log(`Processed document: ${docInfo.title}`);
    }

    // Calculate and log statistics (unrelated low-level details)
    const totalWords = results.reduce((sum, doc) => sum + doc.statistics.wordCount, 0);
    const totalChars = results.reduce((sum, doc) => sum + doc.statistics.characterCount, 0);
    console.log(`Total words across all documents: ${totalWords}`);
    console.log(`Total characters across all documents: ${totalChars}`);
    console.log(`Average words per document: ${totalWords / results.length}`);

    return results;
  }

  // Violates SLAP by mixing document retrieval with document processing and statistics
  getDocumentByTitle(title) {
    // Find document (appropriate level)
    const document = this.documents.find(doc => doc.title === title);

    if (document) {
      // Calculate additional statistics (mixing in unrelated operations)
      const wordLengths = document.content.split(/\s+/).map(word => word.length);
      const averageWordLength = wordLengths.reduce((sum, length) => sum + length, 0) / wordLengths.length;

      // Log information (unrelated operation)
      console.log(`Retrieved document: ${title}`);
      console.log(`Average word length: ${averageWordLength.toFixed(2)}`);

      // Update access time (unrelated side effect)
      document.lastAccessed = new Date();
    }

    return document;
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
  console.log("\nProcessed Documents:");
  processedDocuments.forEach(doc => {
    console.log(`\nTitle: ${doc.title}`);
    console.log(`Word Count: ${doc.statistics.wordCount}`);
    console.log(`Character Count: ${doc.statistics.characterCount}`);
    console.log(`Paragraph Count: ${doc.statistics.paragraphCount}`);
    console.log(`Summary: ${doc.summary}`);
    console.log(`Formatted Content:\n${doc.formattedContent}`);
  });

  // Retrieve a specific document
  processor.getDocumentByTitle("Design Principles");
}

// Run the demonstration
demonstrateDocumentProcessor();

/**
 * This violates the Single Level of Abstraction Principle because:
 *
 * 1. Mixed Abstraction Levels:
 *    - The 'processDocument' method mixes high-level operations (returning processed data)
 *      with low-level implementation details (counting words, formatting content)
 *    - The 'processDocuments' method combines document creation, processing, results collection,
 *      and statistics calculation all in one method
 *    - The 'getDocumentByTitle' method mixes document retrieval with unrelated statistics
 *      calculation and logging
 *
 * 2. Inconsistent Method Responsibilities:
 *    - Methods have multiple, unrelated responsibilities
 *    - There's no clear separation between orchestration and implementation
 *    - Methods perform tasks that should be delegated to more specialized methods
 *
 * 3. Lack of Hierarchical Organization:
 *    - The code is flat rather than hierarchical, with no clear distinction between
 *      high-level operations and low-level details
 *    - There's no natural flow from general to specific operations
 *
 * 4. Reduced Readability:
 *    - Methods are long and complex, making them harder to understand
 *    - The mixing of abstraction levels increases cognitive load
 *    - The code doesn't read like a well-structured narrative
 *
 * 5. Decreased Maintainability:
 *    - Changes to low-level implementation details require modifying high-level methods
 *    - Adding new functionality often means modifying existing methods rather than adding new ones
 *    - Testing is more difficult because methods have multiple responsibilities
 *
 * By violating SLAP, this code is less readable, harder to maintain, and more difficult to extend.
 * The mixing of abstraction levels creates cognitive dissonance and makes the code more complex
 * than necessary.
 */