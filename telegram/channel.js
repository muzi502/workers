// Website you intended to retrieve for users.
const upstream = 't.me'

// Custom pathname for the upstream website.
const upstream_path = '/s/wuhancensored'

// Whether to use HTTPS protocol for upstream address.
const https = true

const replace_dict = {
    '$upstream': '$custom_domain',
    'cdn1.telesco.pe': 'cdn1.k8srss.workers.dev',
    'cdn2.telesco.pe': 'cdn2.k8srss.workers.dev',
    'cdn3.telesco.pe': 'cdn3.k8srss.workers.dev',
    'cdn4.telesco.pe': 'cdn4.k8srss.workers.dev',
    'cdn5.telesco.pe': 'cdn5.k8srss.workers.dev',
    'telegram.org': 'telegram.k8srss.workers.dev'
}

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

    let text = await response.text()
    for (i in replace_dict) {
    j = replace_dict[i];
    let re = new RegExp(i, "g");
    text = text.replace(re, j);
    }
    let modified = text

    return new Response(modified, {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
    })
    return response;
}