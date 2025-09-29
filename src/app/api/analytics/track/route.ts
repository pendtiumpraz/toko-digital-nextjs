import { NextRequest, NextResponse } from 'next/server'
import { recordPageView } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { storeId, visitorId, page } = body

    if (!storeId) {
      return NextResponse.json(
        { error: 'Store ID is required' },
        { status: 400 }
      )
    }

    await recordPageView(storeId, visitorId, page)

    return NextResponse.json({
      success: true,
      message: 'Page view recorded'
    })
  } catch (error) {
    console.error('Error tracking page view:', error)
    return NextResponse.json(
      { error: 'Failed to track page view' },
      { status: 500 }
    )
  }
}

export async function GET() {
  // Return tracking script for embedding in store websites
  const trackingScript = `
    (function() {
      var visitorId = localStorage.getItem('toko_visitor_id') ||
        'visitor_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('toko_visitor_id', visitorId);

      var storeId = window.TOKO_STORE_ID;
      if (!storeId) return;

      function trackPageView() {
        fetch('/api/analytics/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            storeId: storeId,
            visitorId: visitorId,
            page: window.location.pathname
          })
        }).catch(function(e) {
          console.warn('Analytics tracking failed:', e);
        });
      }

      // Track initial page load
      trackPageView();

      // Track navigation for SPAs
      var originalPushState = history.pushState;
      history.pushState = function() {
        originalPushState.apply(history, arguments);
        setTimeout(trackPageView, 0);
      };

      var originalReplaceState = history.replaceState;
      history.replaceState = function() {
        originalReplaceState.apply(history, arguments);
        setTimeout(trackPageView, 0);
      };

      window.addEventListener('popstate', trackPageView);
    })();
  `

  return new NextResponse(trackingScript, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600'
    }
  })
}