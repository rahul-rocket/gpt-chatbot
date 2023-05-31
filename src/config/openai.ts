import { Configuration } from "openai";

// OpenAI API configuration
export default function openAIConfig(): Configuration {
    return new Configuration({
        apiKey: process.env.OPENAI_API_KEY,
        organization: process.env.OPENAI_ORGANIZATION_ID
    });
}