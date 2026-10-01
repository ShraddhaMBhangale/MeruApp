import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('[auth/callback] origin:', origin, '| next:', next, '| code:', code ? 'present' : 'MISSING')

  if (code) {
    const redirectResponse = NextResponse.redirect(`${origin}${next}`)

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
              redirectResponse.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    console.log('[auth/callback] exchangeCodeForSession:', error ? `ERROR: ${error.message}` : 'SUCCESS')

    if (!error) {
      return redirectResponse
    }

    // Surface the exact error so we can debug
    const errMsg = encodeURIComponent(error.message)
    const fallbackWithErr = next.startsWith('/portal')
      ? `/portal-login?error=${errMsg}`
      : `/login?error=${errMsg}`
    return NextResponse.redirect(`${origin}${fallbackWithErr}`)
  }

  console.log('[auth/callback] no code in request — falling back')
  const fallback = next.startsWith('/portal')
    ? '/portal-login?error=no_code'
    : '/login?error=no_code'
  return NextResponse.redirect(`${origin}${fallback}`)
}
