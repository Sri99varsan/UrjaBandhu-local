import { createWorker, Worker, PSM } from 'tesseract.js';

export interface OCRResult {
  text: string;
  confidence: number;
  words: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
  blocks: Array<{
    text: string;
    confidence: number;
    bbox: {
      x0: number;
      y0: number;
      x1: number;
      y1: number;
    };
  }>;
}

export interface OCRProgress {
  status: string;
  progress: number;
}

export class TesseractOCR {
  private worker: Worker | null = null;
  private isInitialized = false;

  /**
   * Initialize the OCR worker
   * @param language - Language code (default: 'eng', also supports 'hin' for Hindi)
   * @param options - Additional Tesseract options
   */
  async initialize(
    language: string = 'eng',
    options: Record<string, any> = {}
  ): Promise<void> {
    if (this.isInitialized && this.worker) {
      return;
    }

    try {
      // Create worker with language support
      this.worker = await createWorker(language, 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            // You can emit progress events here if needed
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
        ...options
      });

      // Set additional parameters for better OCR accuracy
      await this.worker.setParameters({
        tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,()-',
        preserve_interword_spaces: '1',
      });

      this.isInitialized = true;
      console.log('✅ Tesseract OCR initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize Tesseract OCR:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OCR initialization failed: ${errorMessage}`);
    }
  }

  /**
   * Recognize text from an image
   * @param imageInput - Image file, URL, or base64 string
   * @param options - Recognition options
   */
  async recognize(
    imageInput: File | string | HTMLCanvasElement | HTMLImageElement,
    options: {
      includeBlocks?: boolean;
      includeWords?: boolean;
      language?: string;
    } = {}
  ): Promise<OCRResult> {
    if (!this.worker || !this.isInitialized) {
      throw new Error('OCR worker not initialized. Call initialize() first.');
    }

    try {
      const { includeBlocks = true, includeWords = true } = options;

      // Perform OCR recognition
      const result = await this.worker.recognize(imageInput, {}, {
        blocks: includeBlocks,
        text: true,
        hocr: false,
        tsv: false,
        box: false,
        unlv: false,
        osd: false,
        pdf: false,
        imageColor: false,
        imageGrey: false,
        imageBinary: false,
        debug: false,
      });

      // Extract text and confidence
      const text = result.data.text.trim();
      const confidence = result.data.confidence / 100; // Convert to 0-1 range

      // Extract word-level data if requested
      const words: any[] = [];
      const blocks: any[] = [];

      // For now, return basic result
      // Full word/block extraction can be added when needed
      console.log(`✅ OCR completed with ${confidence * 100}% confidence`);
      console.log(`📝 Extracted text: "${text}"`);

      return {
        text,
        confidence,
        words,
        blocks,
      };
    } catch (error) {
      console.error('❌ OCR recognition failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`OCR recognition failed: ${errorMessage}`);
    }
  }

  /**
   * Process image for device detection specifically
   * @param imageInput - Image file or URL
   */
  async detectDeviceText(
    imageInput: File | string
  ): Promise<{
    deviceText: string;
    confidence: number;
    detectedBrands: string[];
    detectedCategories: string[];
    rawText: string;
  }> {
    const ocrResult = await this.recognize(imageInput, {
      includeBlocks: true,
      includeWords: true,
    });

    // Device-specific text processing
    const deviceKeywords = {
      brands: [
        'Samsung', 'LG', 'Sony', 'Panasonic', 'Whirlpool', 'Godrej', 'Haier',
        'Philips', 'Bajaj', 'Havells', 'Orient', 'Crompton', 'IFB', 'Bosch',
        'Voltas', 'Blue Star', 'Carrier', 'Daikin', 'Hitachi', 'Mitsubishi',
        'TCL', 'Xiaomi', 'OnePlus', 'Realme', 'Apple', 'Dell', 'HP', 'Lenovo'
      ],
      categories: [
        'TV', 'Television', 'LED', 'OLED', 'Smart TV',
        'AC', 'Air Conditioner', 'Split AC', 'Window AC', 'Inverter',
        'Refrigerator', 'Fridge', 'Double Door', 'Single Door',
        'Washing Machine', 'Washer', 'Top Load', 'Front Load',
        'Microwave', 'Oven', 'Convection', 'Grill',
        'Fan', 'Ceiling Fan', 'Table Fan', 'Exhaust Fan',
        'Water Heater', 'Geyser', 'Storage', 'Instant',
        'Bulb', 'LED', 'CFL', 'Tube Light',
        'Laptop', 'Computer', 'Desktop', 'Monitor'
      ]
    };

    const text = ocrResult.text.toLowerCase();
    const detectedBrands = deviceKeywords.brands.filter(brand => 
      text.includes(brand.toLowerCase())
    );
    
    const detectedCategories = deviceKeywords.categories.filter(category => 
      text.includes(category.toLowerCase())
    );

    // Clean and process device-specific text
    const deviceText = ocrResult.text
      .replace(/[^\w\s\-\.]/g, ' ') // Remove special chars except dash and dot
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();

    return {
      deviceText,
      confidence: ocrResult.confidence,
      detectedBrands,
      detectedCategories,
      rawText: ocrResult.text,
    };
  }

  /**
   * Terminate the OCR worker to free memory
   */
  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
      this.isInitialized = false;
      console.log('✅ Tesseract OCR worker terminated');
    }
  }

  /**
   * Check if OCR is ready
   */
  isReady(): boolean {
    return this.isInitialized && this.worker !== null;
  }
}

// Singleton instance for reuse
let ocrInstance: TesseractOCR | null = null;

/**
 * Get or create OCR instance
 */
export const getOCRInstance = async (language: string = 'eng'): Promise<TesseractOCR> => {
  if (!ocrInstance) {
    ocrInstance = new TesseractOCR();
    await ocrInstance.initialize(language);
  } else if (!ocrInstance.isReady()) {
    await ocrInstance.initialize(language);
  }
  
  return ocrInstance;
};

/**
 * Quick OCR function for simple text extraction
 */
export const extractTextFromImage = async (
  imageInput: File | string,
  language: string = 'eng'
): Promise<OCRResult> => {
  const ocr = await getOCRInstance(language);
  return await ocr.recognize(imageInput);
};

/**
 * Device-specific OCR function
 */
export const detectDeviceFromImage = async (
  imageInput: File | string,
  language: string = 'eng'
): Promise<{
  deviceText: string;
  confidence: number;
  detectedBrands: string[];
  detectedCategories: string[];
  rawText: string;
}> => {
  const ocr = await getOCRInstance(language);
  return await ocr.detectDeviceText(imageInput);
};
