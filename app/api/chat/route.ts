import { createClient } from '@/utils/supabase/server'
import { google } from '@ai-sdk/google'
import { embed, streamText } from 'ai'
import { z } from 'zod'

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
    const { messages, courseId, lessonId } = await req.json()
    const lastMessage = messages[messages.length - 1]

    const supabase = await createClient()

    // 1. Get embedding for user query
    const { embedding } = await embed({
        model: google.textEmbeddingModel('text-embedding-004'),
        value: lastMessage.content.replaceAll('\n', ' ')
    })

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
        model: google('gemini-2.0-flash'),
        system: `You are a helpful AI Tutor for an online course platform called Ekonex.
     You are answering questions based on the provided course context.
     If the answer is not in the context, check if you can answer from general knowledge but mention that it might not be covered in the specific lesson.
     Be concise, encouraging, and clear.
     
     Context:
     ${context}
    `,
        messages,
    })

    return result.toTextStreamResponse()
}
