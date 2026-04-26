// Using Web Crypto API so it works in Edge Runtime (Middleware) and Node Runtime

export async function signSession(payload, secret) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', key, enc.encode(payload));
  const sigHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
    
  return `${payload}.${sigHex}`;
}

export async function verifySession(token, secret) {
  if (!token) return false;
  
  const parts = token.split('.');
  if (parts.length !== 2) return false;
  
  const [payload, sigHex] = parts;
  const expectedToken = await signSession(payload, secret);
  
  // Constant-time string comparison
  if (expectedToken.length !== token.length) return false;
  
  let match = 0;
  for (let i = 0; i < expectedToken.length; i++) {
    match |= expectedToken.charCodeAt(i) ^ token.charCodeAt(i);
  }
  
  return match === 0 ? payload : false;
}

export function constantTimeCompare(a, b) {
  if (a.length !== b.length) return false;
  let match = 0;
  for (let i = 0; i < a.length; i++) {
    match |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return match === 0;
}
