


import { GoogleGenAI, Type } from "@google/genai";
import { Valuation, DetailedValuation, BatchValuationResult, HistoricalDataPoint, DomainAvailability, DomainRecommendation } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const valuationSchema = {
    type: Type.OBJECT,
    properties: {
        domainName: { type: Type.STRING },
        estimatedValue: { type: Type.NUMBER, description: "Estimated market value in USD. Just a number, no symbols or commas." },
        justification: { type: Type.STRING, description: "A short, compelling reason for the valuation (max 15 words)." },
    },
    required: ["domainName", "estimatedValue", "justification"],
};

const batchValuationSchema = {
    type: Type.OBJECT,
    properties: {
        valuations: {
            type: Type.ARRAY,
            items: valuationSchema,
        },
        methodology: {
            type: Type.STRING,
            description: "A concise explanation of the methodology used for the valuation, including factors considered. (e.g., 'Valuations are based on keyword strength, TLD, brandability, recent comparable sales, and commercial potential.')."
        },
        resources: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "A list of data sources or tools consulted for the valuation. (e.g., 'Comparable sales data from NameBio.com', 'SEO keyword data from Ahrefs', 'Market trend analysis'). If many, summarize."
        }
    },
    required: ["valuations", "methodology", "resources"]
};


const detailedValuationSchema = {
    type: Type.OBJECT,
    properties: {
        domainName: { type: Type.STRING },
        currentValue: { type: Type.NUMBER },
        futureProjections: {
            type: Type.OBJECT,
            properties: {
                threeMonth: { type: Type.NUMBER, description: "3-Month Estimated Value" },
                sixMonth: { type: Type.NUMBER, description: "6-Month Estimated Value" },
                twelveMonth: { type: Type.NUMBER, description: "12-Month Estimated Value" },
            },
            required: ["threeMonth", "sixMonth", "twelveMonth"]
        },
        coreInfluencers: {
            type: Type.OBJECT,
            properties: {
                keywordValue: { type: Type.STRING, description: "e.g., High, Medium, Low" },
                searchVolume: { type: Type.STRING, description: "e.g., 25k/mo" },
                salesHistory: { type: Type.STRING, description: "e.g., Strong, Moderate, Weak" },
                marketTrend: { type: Type.STRING, description: "e.g., Growing, Stable, Declining" }
            },
            required: ["keywordValue", "searchVolume", "salesHistory", "marketTrend"]
        },
        growthPotential: {
            type: Type.OBJECT,
            properties: {
                opportunity: { type: Type.INTEGER, description: "Score out of 10 for market opportunity" },
            },
             required: ["opportunity"]
        }
    },
    required: ["domainName", "currentValue", "futureProjections", "coreInfluencers", "growthPotential"]
};

export const getBatchValuation = async (domains: string[]): Promise<BatchValuationResult> => {
    try {
        const prompt = `Act as a professional domain appraiser. Analyze the following domain names: ${domains.join(', ')}. Provide a realistic market valuation in USD for each.
        In addition to the valuations, provide:
        1. A 'methodology' explaining how you calculated the prices.
        2. A 'resources' array listing the data sources you consulted. Summarize if there are many.
        Return the entire payload in the specified JSON format.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: batchValuationSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as BatchValuationResult;
    } catch (error) {
        console.error("Error fetching batch valuation:", error);
        throw new Error("Failed to get valuations from AI.");
    }
};

export const getDetailedValuation = async (domain: string): Promise<DetailedValuation> => {
    try {
        const prompt = `Provide a deep-dive valuation for the domain "${domain}". Analyze its current value, future projections, core market influencers, and its growth potential based on market opportunity. Output the analysis in the specified JSON format.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: detailedValuationSchema,
            },
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DetailedValuation;
    } catch (error) {
        console.error("Error fetching detailed valuation:", error);
        throw new Error("Failed to get detailed valuation from AI.");
    }
};

export const getInfluencerExplanation = async (domain: string, influencer: string, value: string): Promise<string> => {
    try {
        const prompt = `For the domain "${domain}", its "${influencer}" has been rated as "${value}".
Explain what this means in the context of domain valuation.
Provide a concise definition of the factor, and then give specific evidence or reasoning for why "${domain}" received this rating.
Keep the explanation clear, easy to understand for a non-expert, and under 150 words.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
        });

        return response.text;
    } catch (error) {
        console.error("Error fetching influencer explanation:", error);
        throw new Error("Failed to get explanation from AI.");
    }
};

const historicalDataSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            month: { type: Type.STRING, description: "The month and year, e.g., 'Jan 2023'" },
            value: { type: Type.NUMBER, description: "The estimated value in USD for that month." },
        },
        required: ["month", "value"],
    }
};

export const getHistoricalValuation = async (domain: string): Promise<HistoricalDataPoint[]> => {
    try {
        const prompt = `Act as a professional domain appraiser. Generate a realistic, estimated monthly valuation history for the domain "${domain}" for the past 12 months, ending with the current month. Base your valuation on historical market trends, comparable domain sales during that period, shifts in keyword relevance and search volume, and the general economic climate. Present the data as a JSON array of objects, where each object has 'month' (e.g., 'Jan 2024') and 'value' (a number). Ensure the months are in chronological order.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        history: historicalDataSchema
                    },
                    required: ["history"]
                },
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.history as HistoricalDataPoint[];
    } catch (error) {
        console.error("Error fetching historical valuation:", error);
        throw new Error("Failed to get historical valuation from AI.");
    }
};

export const checkDomainAvailability = async (domain: string): Promise<DomainAvailability> => {
    try {
        const prompt = `Act as a domain availability checker. Your sole purpose is to determine if a domain is available for purchase based on real-time Google Search results.
Check the domain: "${domain}".
Analyze search results from top registrars (GoDaddy, Namecheap, etc.).

If you find conclusive evidence of its availability status (either taken or available), respond *only* with a valid JSON object in this exact format:
{
  "available": boolean,
  "registrar": string | null,
  "purchasePrice": number | null
}

If the search results are inconclusive or you cannot determine the status with high confidence, respond with this specific JSON object:
{
  "available": false,
  "registrar": null,
  "purchasePrice": null
}

Do not add any other text, markdown, or explanations outside of the single JSON object.`;
        
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            }
        });

        const textResponse = response.text;
        // The model might return a JSON string inside a markdown block, or just the raw string.
        // It might also include conversational text. We need to find the JSON part.
        const jsonMatch = textResponse.match(/{[\s\S]*}/);

        if (jsonMatch && jsonMatch[0]) {
            try {
                return JSON.parse(jsonMatch[0]) as DomainAvailability;
            } catch(e) {
                // This will catch cases where the regex finds something that isn't valid JSON.
                console.error(`Failed to parse JSON from AI response for ${domain}. Response fragment: "${jsonMatch[0]}"`, e);
                throw new Error("AI response contained malformed JSON.");
            }
        }
        
        // If no JSON object is found in the response.
        console.error(`No JSON object found in AI response for ${domain}. Full response: "${textResponse}"`);
        throw new Error("AI response did not contain valid JSON.");

    } catch (error) {
        // Log the full error from the API call or parsing
        console.error(`Error in checkDomainAvailability for ${domain}.`, error);
        
        // Return a safe default to the user to prevent app crashes.
        return { available: false, registrar: null, purchasePrice: null };
    }
};

const recommendationSchema = {
    type: Type.OBJECT,
    properties: {
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    domainName: { type: Type.STRING },
                    estimatedValue: { type: Type.NUMBER, description: "Estimated market value in USD." },
                    reason: { type: Type.STRING, description: "Brief reason why this is a good alternative." },
                },
                required: ["domainName", "estimatedValue", "reason"],
            },
        },
    },
    required: ["recommendations"],
};

export const getDomainRecommendations = async (domain: string, value: number): Promise<DomainRecommendation[]> => {
    try {
        const prompt = `The domain "${domain}" is valued at approximately $${value}. Based on its keywords, niche, and TLD, suggest up to 3 similar domains that could have a higher value and are **very likely to be available for standard registration**. Do not suggest premium or already taken domains. The domains should be creative and commercially viable alternatives. For each suggestion, provide a realistic estimated value and a brief reason for the recommendation. Format the response as a JSON object.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: recommendationSchema,
            },
        });

        const jsonText = response.text.trim();
        const parsed = JSON.parse(jsonText);
        return parsed.recommendations as DomainRecommendation[];
    } catch (error) {
        console.error("Error fetching domain recommendations:", error);
        throw new Error("Failed to get domain recommendations from AI.");
    }
};

export const getTrendingDomains = async (): Promise<DomainRecommendation[]> => {
    try {
        const prompt = `Act as a futurist and domain investment strategist. Your primary goal is to find currently unregistered, available-for-standard-registration domain names based on emerging trends.
1.  **Analyze Trends**: Use Google Search to analyze emerging technologies (AI, biotech, future of work), recent policy changes (AI regulation, climate policy), and investment trends.
2.  **Generate Ideas**: Based on your analysis, brainstorm a list of creative, brandable, and commercially viable domain names. Use a variety of modern TLDs (.com, .ai, .io, .tech, .xyz).
3.  **CRITICAL STEP - VERIFY AVAILABILITY**: This is the most important instruction. For each domain idea, you MUST use Google Search to verify it is available for immediate, standard-price registration. Check multiple registrars like GoDaddy, Namecheap, and Google Domains. A domain is considered **UNAVAILABLE** and you MUST NOT include it if: it has an existing website, it's listed as a "premium" domain, it's for sale on an auction site, or a registrar shows it as taken. If you are not 100% certain it's available for standard registration, discard it and find another one.
4.  **Format Output**: Return a list of 5 domains that you have **personally verified as available for standard registration**. For each domain, provide its estimated market value, a concise 'reason' for its value, and crucially, the 'registrar' (e.g., "GoDaddy", "Namecheap") where you confirmed its availability. The 'registrar' field is mandatory.

Respond ONLY with a valid JSON object wrapped in markdown \`\`\`json ... \`\`\`. The JSON object must have a single key "recommendations" which is an array of objects, each with "domainName" (string), "estimatedValue" (number), "reason" (string), and "registrar" (string, e.g., "GoDaddy"). If you cannot find any available domains after a thorough search, return an empty "recommendations" array.`;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{googleSearch: {}}],
            },
        });

        const textResponse = response.text;
        // The model might return a JSON string inside a markdown block.
        const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```/);

        if (jsonMatch && jsonMatch[1]) {
            try {
                const parsed = JSON.parse(jsonMatch[1]);
                return parsed.recommendations as DomainRecommendation[];
            } catch(e) {
                console.error(`Failed to parse JSON from trending domains response. Response fragment: "${jsonMatch[1]}"`, e);
                throw new Error("Trending domains response contained malformed JSON.");
            }
        }
        
        console.error(`No JSON object found in trending domains response. Full response: "${textResponse}"`);
        throw new Error("Trending domains response did not contain valid JSON.");

    } catch (error) {
        console.error("Error fetching trending domains:", error);
        throw new Error("Failed to get trending domains from AI.");
    }
};