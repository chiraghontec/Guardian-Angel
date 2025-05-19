
'use server';

/**
 * @fileOverview Analyzes text for potential bullying and depressive content.
 *
 * - analyzeTextContent - A function that analyzes text for the specified concerns.
 * - AnalyzeTextContentInput - The input type for the analyzeTextContent function.
 * - AnalyzeTextContentOutput - The return type for the analyzeTextContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeTextContentInputSchema = z.object({
  text: z
    .string()
    .describe("The text to analyze."),
});
export type AnalyzeTextContentInput = z.infer<typeof AnalyzeTextContentInputSchema>;

const AnalyzeTextContentOutputSchema = z.object({
  isBullying: z.boolean().describe('Whether or not the text contains bullying.'),
  bullyingSeverity: z
    .number()
    .optional()
    .describe(
      'The severity of the bullying, on a scale from 0 to 1, if bullying is detected.'
    ),
  isDepressive: z.boolean().describe('Whether or not the text shows signs of depressive content or ideation.'),
  depressiveSeverity: z
    .number()
    .optional()
    .describe(
      'The severity of the depressive content, on a scale from 0 to 1, if detected.'
    ),
  explanation: z
    .string()
    .describe('An explanation of why the text was flagged, covering both bullying and depressive aspects if applicable.'),
});
export type AnalyzeTextContentOutput = z.infer<typeof AnalyzeTextContentOutputSchema>;

export async function analyzeTextContent(input: AnalyzeTextContentInput): Promise<AnalyzeTextContentOutput> {
  return analyzeTextContentFlow(input);
}

const analyzeTextPrompt = ai.definePrompt({
  name: 'analyzeTextPrompt',
  input: {schema: AnalyzeTextContentInputSchema},
  output: {schema: AnalyzeTextContentOutputSchema},
  prompt: `You are an AI assistant that analyzes text messages and social media posts for potential bullying AND signs of depressive thoughts or ideation.

  You will receive a text and must determine:
  1. If it is bullying. If yes, set isBullying to true and provide a bullyingSeverity (0-1). Otherwise, set isBullying to false.
  2. If it shows signs of depressive content. If yes, set isDepressive to true and provide a depressiveSeverity (0-1). Otherwise, set isDepressive to false.
  
  Provide a single explanation covering your reasoning for both aspects. If neither is detected, explain why the text is considered neutral or positive.

  Text: {{{text}}}`,
   config: { // Adjust safety settings if needed for this kind of sensitive content analysis
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE', // Example: be more permissive if analyzing potentially problematic user content
      },
       {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      // It's crucial to consider Gemini's safety policies regarding self-harm.
      // Explicitly asking to detect "depressive speech" might trigger stricter filtering.
      // The prompt is phrased carefully, but this is an area for careful testing.
      // If results are consistently blocked, the prompt or safety settings may need adjustment.
    ],
  },
});

const analyzeTextContentFlow = ai.defineFlow(
  {
    name: 'analyzeTextContentFlow',
    inputSchema: AnalyzeTextContentInputSchema,
    outputSchema: AnalyzeTextContentOutputSchema,
  },
  async input => {
    const {output} = await analyzeTextPrompt(input);
    // Ensure severities are set if flags are true, default to 0 if not provided by LLM
    if (output) {
        if (output.isBullying && output.bullyingSeverity === undefined) output.bullyingSeverity = 0.5; // Default if not set
        if (output.isDepressive && output.depressiveSeverity === undefined) output.depressiveSeverity = 0.5; // Default if not set
    }
    return output!;
  }
);

