import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/ai-chatbot'

    console.log('🔄 Callback route hit:', { code: code?.substring(0, 10) + '...', next, origin })

    if (code) {
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    get(name: string) {
                        return request.cookies.get(name)?.value
                    },
                    set(name: string, value: string, options) {
                        request.cookies.set({
                            name,
                            value,
                            ...options,
                        })
                    },
                    remove(name: string, options) {
                        request.cookies.set({
                            name,
                            value: '',
                            ...options,
                        })
                    },
                },
            }
        )

        console.log('🔄 Exchanging code for session...')
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!error) {
            console.log('✅ Session exchange successful, redirecting to:', next)

            // For production deployment on Vercel - always use the production domain
            const redirectUrl = `https://urjabandhu.vercel.app${next}`
            console.log('🔄 Redirecting to:', redirectUrl)

            return NextResponse.redirect(redirectUrl)
        } else {
            console.error('❌ Session exchange failed:', error)
        }
    }

    // return the user to an error page with instructions
    console.log('❌ No code found or session exchange failed, redirecting to error page')
    return NextResponse.redirect(`https://urjabandhu.vercel.app/auth/auth-code-error`)
}
