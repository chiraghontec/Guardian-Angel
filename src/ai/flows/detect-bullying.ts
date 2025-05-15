// src/ai/flows/detect-bullying.ts
'use server';

/**
 * @fileOverview Detects potential bullying in text messages and social media posts.
 *
 * - detectBullying - A function that analyzes text for potential bullying.
 * - DetectBullyingInput - The input type for the detectBullying function.
 * - DetectBullyingOutput - The return type for the detectBullying function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectBullyingInputSchema = z.object({
  text: z
    .string()
    .describe("The text to analyze for potential bullying."),
});
export type DetectBullyingInput = z.infer<typeof DetectBullyingInputSchema>;

const DetectBullyingOutputSchema = z.object({
  isBullying: z.boolean().describe('Whether or not the text contains bullying.'),
  severity: z
    .number()
    .describe(
      'The severity of the bullying, on a scale from 0 to 1, where 0 is not bullying and 1 is severe bullying.'
    ),
  explanation: z
    .string()
    .describe('An explanation of why the text was flagged as bullying.'),
});
export type DetectBullyingOutput = z.infer<typeof DetectBullyingOutputSchema>;

export async function detectBullying(input: DetectBullyingInput): Promise<DetectBullyingOutput> {
  return detectBullyingFlow(input);
}

const detectBullyingPrompt = ai.definePrompt({
  name: 'detectBullyingPrompt',
  input: {schema: DetectBullyingInputSchema},
  output: {schema: DetectBullyingOutputSchema},
  prompt: `You are an AI assistant that analyzes text messages and social media posts for potential bullying.

  You will receive a text and must determine if it is bullying. If it is bullying, set the isBullying output field to true, otherwise set it to false.
  Also set the severity field with a number between 0 and 1.
  Explain your reasoning.

  Text: {{{text}}} `,
});

const detectBullyingFlow = ai.defineFlow(
  {
    name: 'detectBullyingFlow',
    inputSchema: DetectBullyingInputSchema,
    outputSchema: DetectBullyingOutputSchema,
  },
  async input => {
    const {output} = await detectBullyingPrompt(input);
    return output!;
  }
);
