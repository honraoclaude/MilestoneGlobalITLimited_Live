import { NextRequest, NextResponse } from 'next/server'
import { anthropic, streamSSE } from '@/lib/stream'
import { checkRateLimit, getIp } from '@/lib/rate-limit'
import { checkBodySize } from '@/lib/validate'

const SYSTEM_PROMPT = `You are an expert UK recruitment consultant and talent acquisition specialist with 15 years of experience writing job descriptions that attract top candidates.

Always produce output in exactly this structure:

**[JOB TITLE]**
📍 [Location] | 💼 [Work Type] | 💰 [Salary Range]

**About the Role**
[2 paragraphs — what the role involves, the team context, and why it's an exciting opportunity]

**Key Responsibilities**
• [Responsibility 1]
• [Responsibility 2]
• [Responsibility 3]
• [Responsibility 4]
• [Responsibility 5]
• [Responsibility 6]
• [Responsibility 7]
(7–10 bullets total)

**Essential Requirements**
• [Requirement 1]
• [Requirement 2]
• [Requirement 3]
• [Requirement 4]
• [Requirement 5]
(5–7 bullets)

**Desirable Skills**
• [Skill 1]
• [Skill 2]
• [Skill 3]
(3–5 bullets)

**What We Offer**
• [Benefit 1]
• [Benefit 2]
• [Benefit 3]
• [Benefit 4]
(4–6 bullets)

---
Rules:
- Avoid gendered, ageist, or exclusionary language
- Use inclusive phrases: "experience with" not "must have X years"
- Make the role sound genuinely attractive — this is marketing
- Include [TBC] for any detail not provided
- End with: "⚠️ RECRUITER REVIEW REQUIRED — Review and tailor before posting."`

export async function POST(req: NextRequest) {
  if (!checkRateLimit(getIp(req)).allowed)
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  if (!checkBodySize(req))
    return NextResponse.json({ error: 'Request too large' }, { status: 413 })

  try {
    const { jobTitle, sector, location, salaryRange, workType, keySkills } = await req.json()

    if (!jobTitle || !keySkills?.trim()) {
      return NextResponse.json({ error: 'jobTitle and keySkills are required' }, { status: 400 })
    }

    const userMessage = `Write a job description for the following role:

Job title: ${jobTitle}
Sector: ${sector || '[TBC]'}
Location: ${location || '[TBC]'}
Salary range: ${salaryRange || '[TBC]'}
Work type: ${workType || 'Permanent'}

Key skills, requirements, and notes:
${keySkills}`

    return streamSSE(async (controller, encoder, signal) => {
      const claudeStream = anthropic.messages.stream({
        model: 'claude-sonnet-4-6',
        max_tokens: 1500,
        system: [{ type: 'text', text: SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: userMessage }],
      }, { signal })

      for await (const event of claudeStream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`))
        }
      }
    })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Server error' }, { status: 500 })
  }
}
