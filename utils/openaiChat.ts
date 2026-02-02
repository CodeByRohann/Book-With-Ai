import OpenAI from "openai";

// Helper function for chat-style conversations using OpenAI
export async function generateOpenAIChat(messages: any[], systemPrompt: string) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            throw new Error("OPENAI_API_KEY not configured");
        }

        const openai = new OpenAI({ apiKey });

        // Prepare messages for OpenAI
        const openAIMessages = [
            { role: "system", content: systemPrompt },
            ...messages.map((msg) => ({
                role: msg.role === 'ui' ? 'user' : msg.role, // Handle custom roles if any, default valid ones
                content: msg.content
            }))
        ];

        console.log('📝 OpenAI Messages Count:', openAIMessages.length);

        const completion = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: openAIMessages as any,
            temperature: 0.7,
            max_tokens: 4000, // Increased limit for full trip plans
            response_format: { type: "json_object" } // Force JSON as the prompt expects JSON
        });

        const text = completion.choices[0].message.content || "";
        console.log('✅ OpenAI Response Text:', text);
        return text;

    } catch (error) {
        console.error('OpenAI Chat API Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        throw new Error(`OpenAI API Error: ${errorMessage}`);
    }
}
