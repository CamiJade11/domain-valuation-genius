
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

const availabilitySchema = {
    type: Type.OBJECT,
    properties: {
        available: { type: Type.BOOLEAN },
        registrar: {
            type: Type.STRING,
            description: "Name of a popular registrar like GoDaddy or Namecheap if available, otherwise null.",
            nullable: true,
        },
        purchasePrice: {
            type: Type.NUMBER,
            description: "Estimated purchase price in USD if available from the registrar, otherwise null. Just a number.",
            nullable: true,
        },
    },
    required: ["available", "registrar", "purchasePrice"],
};

export const checkDomainAvailability = async (domain: string): Promise<DomainAvailability> => {
    try {
        const prompt = `Is the domain name "${domain}" currently available for registration? Check WHOIS records and common registration platforms. If it is available, try to find an estimated purchase price in USD from a popular registrar. Answer with a JSON object.`;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: availabilitySchema,
            }
        });

        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as DomainAvailability;
    } catch (error) {
        console.error("Error checking domain availability:", error);
        throw new Error("Failed to check domain availability.");
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
        const prompt = `The domain "${domain}" is valued at approximately $${value}. Based on its keywords, niche, and TLD, suggest up to 3 similar domains that could have a higher value and are likely available for registration. For each suggestion, provide a realistic estimated value and a brief reason for the recommendation. The domains should be creative and commercially viable alternatives. Format the response as a JSON object.`;

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