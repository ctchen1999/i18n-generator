import OpenAI from 'openai';
import * as fs from 'fs';

interface TranslationResult {
    [key: string]: {
        [language: string]: string;
    };
}

type Billing = number

export class Translator {
    private openai: OpenAI;
    private targetLanguages = ['zh-TW', 'Japanese', 'Korean', 'Vietnamese', 'Thai'];

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    async translateText(text: string): Promise<TranslationResult> {
        const result: TranslationResult = {};
        result[text] = await this.translateSingle(text);

        return result;
    }

    private async translateSingle(text: string): Promise<{ [language: string]: string }> {
        const translations: { [language: string]: string } = {};
        let bill: Billing = 0;

        for (const targetLang of this.targetLanguages) {
            try {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate the following mandarin text to ${targetLang}. Only respond with the translation without symbol, nothing else.`,
                        },
                        {
                            role: 'user',
                            content: text,
                        },
                    ],
                });

                const translation = response.choices[0].message?.content?.trim() || '';
                bill += await this.translateBilling(response);
                translations[targetLang.toLowerCase()] = translation;
            } catch (error) {
                console.error(`Error translating to ${targetLang}:`, error);
                translations[targetLang.toLowerCase()] = `Error translating to ${targetLang}`;
            }
        }
        console.log("Cost (TWD): ", bill.toFixed(3));

        return translations;
    }

    async translateBilling(response: OpenAI.Chat.Completions.ChatCompletion): Promise<number> {
        const modelName = response.model;
        const promptTokens = response.usage?.prompt_tokens || 0;
        const completionTokens = response.usage?.completion_tokens || 0;

        // Pricing per 1000 tokens (in USD)
        let promptPrice = 0;
        let completionPrice = 0;

        if (modelName.includes('gpt-3.5-turbo')) {
            promptPrice = 0.0015;
            completionPrice = 0.002;
        } 

        // Calculate total cost in USD
        const costUSD = (promptTokens * promptPrice / 1000) + (completionTokens * completionPrice / 1000);
        
        const costTWD = await this.convertUSDtoTWD(costUSD);
        
        return costTWD;
    }

    private async convertUSDtoTWD(amountUSD: number): Promise<number> {
        try {
            // Using ExchangeRate-API to get the conversion rate
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            const data = await response.json();
            
            if (!data.rates || !data.rates.TWD) {
                console.error('Could not fetch TWD exchange rate, using approximate rate of 30');
                return amountUSD * 30;
            }
            
            const usdToTwdRate = data.rates.TWD;
            return amountUSD * usdToTwdRate;
        } catch (error) {
            console.error('Error fetching exchange rate:', error);
            // Fallback to approximate rate if API call fails
            console.log('Using approximate exchange rate of 30 TWD per USD');
            return amountUSD * 30;
        }
    }

    async translateJsonFile(inputPath: string, outputPath: string): Promise<void> {
        try {
            const jsonContent = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));
            const translations = await this.translateText(jsonContent);
            fs.writeFileSync(outputPath, JSON.stringify(translations, null, 2), 'utf-8');
            console.log('Translation completed successfully!');
        } catch (error) {
            console.error('Error processing JSON file:', error);
            throw error;
        }
    }
}
