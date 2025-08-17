import { GoogleGenAI, Type } from "@google/genai";
import { Delivery, OptimizedRouteResult } from '../../frontend/types/index';

if (!process.env.API_KEY) {
    console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || " " });

const PHARMACY_ADDRESS = "Shri Kripa Pharmacy, 123 Health Ave, Wellness City, 54321";

export const optimizeDeliveryRoute = async (deliveries: Delivery[]): Promise<OptimizedRouteResult[]> => {
    if (deliveries.length === 0) {
        return [];
    }

    const deliveryDetails = deliveries.map(d => `- Customer: ${d.patientName}, Address: ${d.address}`);

    const prompt = `
        You are an expert logistics coordinator for a pharmacy. Your task is to create the most efficient delivery route for a driver.
        The delivery driver will start at the pharmacy's location.

        Pharmacy Location: ${PHARMACY_ADDRESS}

        Here is the list of deliveries to be made:
        ${deliveryDetails.join('\n')}

        Please determine the most time-efficient order to visit these locations, starting from the pharmacy.
        Return the result as a valid JSON array where each object contains the customer's name, their full address, and the optimized delivery order number (starting from 1).
    `;

    const responseSchema = {
        type: Type.ARRAY,
        items: {
            type: Type.OBJECT,
            properties: {
                customerName: {
                    type: Type.STRING,
                    description: "The name of the customer for the delivery.",
                },
                address: {
                    type: Type.STRING,
                    description: "The full delivery address provided.",
                },
                optimized_order: {
                    type: Type.INTEGER,
                    description: "The position in the optimized delivery sequence (e.g., 1, 2, 3...)."
                }
            },
            required: ["customerName", "address", "optimized_order"],
        }
    };

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const jsonText = response.text.trim();
        // The Gemini API with a schema should return valid JSON, but we parse defensively
        const optimizedRoute: OptimizedRouteResult[] = JSON.parse(jsonText);
        
        // Sort the result by the optimized order as a fallback
        optimizedRoute.sort((a, b) => a.optimized_order - b.optimized_order);

        return optimizedRoute;
    } catch (error) {
        console.error("Error optimizing route with Gemini:", error);
        // Provide a more specific error message if possible
        if (error instanceof Error && error.message.includes('API_KEY')) {
             throw new Error("Gemini API key is not configured correctly. Please set the API_KEY environment variable.");
        }
        throw new Error("Failed to generate an optimized route. Please check the addresses and your connection, then try again.");
    }
};
