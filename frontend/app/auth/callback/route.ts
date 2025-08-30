import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const origin = requestUrl.origin

    console.log('OAuth callback received:', {
        code: code ? 'present' : 'missing',
        origin,
        url: request.url
    })

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return request.cookies.getAll().map(cookie => ({
                            name: cookie.name,
                            value: cookie.value
                        }))
                    },
                    setAll(cookiesToSet) {
                        // This will be handled by the response
                    },
                },
            }
        )

        try {
            console.log('Exchanging code for session...')

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
                    // If there's an error checking connections, redirect to setup
                    return NextResponse.redirect(`${origin}/auth/callback?setup=true`)
                }

                // Create the response with redirect
                let redirectUrl
                if (connections && connections.length > 0) {
                    // User has connections, redirect to AI chatbot
                    redirectUrl = `${origin}/ai-chatbot`
                } else {
                    // New user, redirect to callback page for setup
                    redirectUrl = `${origin}/auth/callback?setup=true`
                }

                console.log('Redirecting to:', redirectUrl)

                // Create the response with redirect
                const response = NextResponse.redirect(redirectUrl)

                // Set the session cookies
                const supabaseResponse = createServerClient(
                    process.env.NEXT_PUBLIC_SUPABASE_URL!,
                    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
                    {
                        cookies: {
                            getAll() {
                                return response.cookies.getAll().map(cookie => ({
                                    name: cookie.name,
                                    value: cookie.value
                                }))
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
    console.log('No code parameter found, redirecting to auth')
    return NextResponse.redirect(`${origin}/auth?error=no_code`)
}
