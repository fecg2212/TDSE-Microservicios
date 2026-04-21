import { createRemoteJWKSet, jwtVerify } from 'jose';

function extractToken(event) {
  const authHeader = event.headers?.authorization || event.headers?.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing bearer token');
  }
  return authHeader.replace('Bearer ', '').trim();
}

export async function verifyAccessToken(event, requiredScope) {
  const issuer = process.env.AUTH0_ISSUER_URI;
  const audience = process.env.AUTH0_AUDIENCE;
  const normalizedIssuer = issuer.endsWith('/') ? issuer : `${issuer}/`;

  const jwks = createRemoteJWKSet(new URL(`${normalizedIssuer}.well-known/jwks.json`));
  const token = extractToken(event);

  const { payload } = await jwtVerify(token, jwks, {
    issuer: normalizedIssuer,
    audience
  });

  if (requiredScope) {
    const scope = payload.scope || '';
    const permissions = payload.permissions || [];
    const hasScope = String(scope).split(' ').includes(requiredScope) || permissions.includes(requiredScope);
    if (!hasScope) {
      throw new Error(`Missing required scope: ${requiredScope}`);
    }
  }

  return payload;
}

export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
    },
    body: JSON.stringify(body)
  };
}
