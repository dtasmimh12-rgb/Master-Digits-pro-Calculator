import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function processSmartInput(input: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      You are a smart calculator assistant. 
      Convert the following natural language mathematical request into a mathematical expression that can be evaluated by mathjs.
      Request: "${input}"
      Return ONLY a JSON object with the following structure:
      {
        "expression": "the math expression",
        "explanation": "brief explanation of what was done",
        "result_label": "what the result represents"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Smart Input Error:", error);
    return null;
  }
}

export async function getStepByStepSolution(expression: string) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `
      Solve the following mathematical expression step-by-step.
      Expression: "${expression}"
      Return ONLY a JSON object with the following structure:
      {
        "steps": ["step 1", "step 2", ...],
        "final_answer": "the result",
        "formula_used": "the main formula used",
        "explanation": "brief conceptual explanation"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleanText = text.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Student Mode Error:", error);
    return null;
  }
}
