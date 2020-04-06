// Website you intended to retrieve for users.
const upstream = 'cdn4.telesco.pe'

// Custom pathname for the upstream website.
const upstream_path = ''

// Whether to use HTTPS protocol for upstream address.
const https = true

addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request));
})

async function fetchAndApply(request) {

    let response = null;
    let url = new URL(request.url);
    let url_hostname = url.hostname;

    if (https == true) {
        url.protocol = 'https:';
    } else {
        url.protocol = 'http:';
    }

    var upstream_domain = upstream;
    url.host = upstream_domain;
    if (url.pathname == '/') {
        url.pathname = upstream_path;
    } else {
        url.pathname = upstream_path + url.pathname;
    }

    let method = request.method;
    let request_headers = request.headers;
    let new_request_headers = new Headers(request_headers);

    new_request_headers.set('Host', url.hostname);
    new_request_headers.set('Referer', url.hostname);

    let original_response = await fetch(url.href, {
        method: method,
        headers: new_request_headers
    })

    let original_response_clone = original_response.clone();
    let original_text = null;
    let response_headers = original_response.headers;
    let new_response_headers = new Headers(response_headers);
    let status = original_response.status;

    const content_type = new_response_headers.get('content-type');
    if (content_type.includes('text/html') && content_type.includes('UTF-8')) {
        original_text = await replace_response_text(original_response_clone, upstream_domain, url_hostname);
    } else {
        original_text = original_response_clone.body
    }
    response = new Response(original_text, {
        status,
        headers: new_response_headers
    })
    return response;
}