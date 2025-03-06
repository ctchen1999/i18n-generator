import OpenAI from 'openai';
import * as fs from 'fs';

interface TranslationResult {
    [key: string]: {
        [language: string]: string;
    };
}

export class Translator {
    private openai: OpenAI;
    private targetLanguages = ['English', 'zh-TW', 'Japanese', 'Korean', 'Vietnamese', 'Thai'];

    constructor(apiKey: string) {
        this.openai = new OpenAI({
            apiKey: apiKey,
        });
    }

    async translateText(text: string | Record<string, string>): Promise<TranslationResult> {
        const result: TranslationResult = {};

        if (typeof text === 'string') {
            result[text] = await this.translateSingle(text);
        } else {
            for (const [key, value] of Object.entries(text)) {
                result[key] = await this.translateSingle(value);
            }
        }

        return result;
    }

    private async translateSingle(text: string): Promise<{ [language: string]: string }> {
        const translations: { [language: string]: string } = {};

        for (const targetLang of this.targetLanguages) {
            try {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: `You are a professional translator. Translate the following Chinese text to ${targetLang}. Only respond with the translation, nothing else.`,
                        },
                        {
                            role: 'user',
                            content: text,
                        },
                    ],
                });

                const translation = response.choices[0]?.message?.content?.trim() || '';
                translations[targetLang.toLowerCase()] = translation;
            } catch (error) {
                console.error(`Error translating to ${targetLang}:`, error);
                translations[targetLang.toLowerCase()] = `Error translating to ${targetLang}`;
            }
        }

        return translations;
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