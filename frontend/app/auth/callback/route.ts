import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll()
                    },
                    setAll(cookiesToSet) {
                        cookiesToSet.forEach(({ name, value, options }) => {
                            request.cookies.set(name, value)
                        })
                    },
                },
            }
        )

        try {
            // Exchange the code for a session
            const { data: { session }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

            if (exchangeError) {
                console.error('Error exchanging code for session:', exchangeError)
                return NextResponse.redirect(`${origin}/auth?error=exchange_failed`)
            }

            if (session?.user) {
                console.log('OAuth successful for user:', session.user.email)

                // Check if user has any consumer connections
                const { data: connections, error: connectionsError } = await supabase
                    .from('consumer_connections')
                    .select('id')
                    .eq('user_id', session.user.id)
                    .limit(1)

                if (connectionsError) {
                    console.error('Error checking connections:', connectionsError)
                    // If there's an error checking connections, redirect to dashboard
                    return NextResponse.redirect(`${origin}/dashboard`)
                }

                // Create the response with redirect
                const response = connections && connections.length > 0
                    ? NextResponse.redirect(`${origin}/dashboard`)
                    : NextResponse.redirect(`${origin}/setup`)

                // Set the session cookies
                const supabaseResponse = createServerClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        cookies: {
                            getAll() {
                                return request.cookies.getAll()
                            },
                            setAll(cookiesToSet) {
                                cookiesToSet.forEach(({ name, value, options }) => {
                                    response.cookies.set(name, value, options)
                                })
                            },
                        },
                    }
                )

                // Ensure session is set
                await supabaseResponse.auth.setSession(session)

                return response
            }
        } catch (error) {
            console.error('OAuth callback error:', error)
            return NextResponse.redirect(`${origin}/auth?error=callback_failed`)
        }
    }

    // If no code, redirect to auth with error
    return NextResponse.redirect(`${origin}/auth?error=no_code`)
}
