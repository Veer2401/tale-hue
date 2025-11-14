import { GoogleGenerativeAI } from "@google/generative-ai";

const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function main() {
  const model = ai.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  
  const result = await model.generateContent("Explain how AI works in a few words");
  const response = await result.response;
  const text = response.text();
  
  console.log(text);
}

main();
