import { createClient } from '@/utils/supabase/server'
import { openai } from '@ai-sdk/openai'
import { streamText, tool } from 'ai'
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    const { messages, courseId, lessonId } = await req.json()
    const lastMessage = messages[messages.length - 1]

    const supabase = await createClient()

    // 1. Get embedding for user query
    const response = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: lastMessage.content.replaceAll('\n', ' '),
        }),
    })
    if (!response.ok) {
        if (response.status === 429) {
            return new Response('AI quota exceeded. Please check billing.', { status: 429 })
        }
        return new Response('Failed to generate embedding', { status: 500 })
    }

    const embeddingData = await response.json()

    if (!embeddingData.data) {
        return new Response('Failed to generate embedding', { status: 500 })
    }

    const embedding = embeddingData.data[0].embedding

    // 2. Search for relevant context
    const { data: documents } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.5, // Similarity threshold
        match_count: 5, // Top 5 results
    })

    // 3. Construct Context String
    const context = documents
        ?.map((doc: any) => doc.content)
        .join('\n\n') || ''

    // 4. Stream Response
    const result = streamText({
        model: openai('gpt-4o'),
        system: `You are a helpful AI Tutor for an online course platform called Ekonex.
     You are answering questions based on the provided course context.
     If the answer is not in the context, check if you can answer from general knowledge but mention that it might not be covered in the specific lesson.
     Be concise, encouraging, and clear.
     
     Context:
     ${context}
    `,
        messages,
    })

    return result.toDataStreamResponse()
}
