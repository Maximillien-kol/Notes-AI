import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Valid email is required' },
                { status: 400 }
            )
        }

        // Insert subscriber into database
        const { data, error } = await supabase
            .from('subscribers')
            .insert({ email })
            .select()
            .single()

        if (error) {
            // Check if email already exists
            if (error.code === '23505') {
                return NextResponse.json(
                    { message: 'Email already subscribed' },
                    { status: 200 }
                )
            }
            throw error
        }

        // Store email in localStorage (for personalization)
        return NextResponse.json({
            success: true,
            email: data.email
        })
    } catch (error) {
        console.error('Subscription error:', error)
        return NextResponse.json(
            { error: 'Failed to subscribe' },
            { status: 500 }
        )
    }
}
