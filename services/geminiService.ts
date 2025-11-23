import { GoogleGenAI } from "@google/genai";
import { Transaction } from "../types";

const API_KEY = process.env.API_KEY || '';

export const getFinancialAdvice = async (transactions: Transaction[], context: string): Promise<string> => {
  if (!API_KEY) {
    return "API Key is missing. Please configure the environment to use AI features.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    // Filter relevant transactions for analysis
    const recentTransactions = transactions.slice(0, 50); // Analyze last 50 to save tokens
    const dataString = JSON.stringify(recentTransactions.map(t => ({
      date: t.date,
      type: t.type,
      category: t.category,
      amount: t.amount,
      context: t.context
    })));

    const prompt = `
      You are a helpful financial advisor for an Indian household.
      Analyze the following expense data for the '${context}' context (or mixed if both).
      Data: ${dataString}

      Please provide:
      1. A brief summary of spending habits.
      2. Three specific tips to save money based on these categories in Indian Rupees (₹).
      3. Identify any unusual spending spikes.

      Keep the tone encouraging and practical. Limit response to 200 words.
      Format the output in clean Markdown.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "No advice generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Unable to generate insights at this moment. Please try again later.";
  }
};
