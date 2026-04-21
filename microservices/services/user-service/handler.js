import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { json, verifyAccessToken } from './auth.js';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const usersTable = process.env.USERS_TABLE;

export const getMe = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return json(200, { ok: true });
  }

  try {
    const claims = await verifyAccessToken(event, 'read:profile');

    const profile = {
      sub: claims.sub,
      name: claims.name || null,
      email: claims.email || null,
      scopes: String(claims.scope || '').split(' ').filter(Boolean)
    };

    await db.send(new PutCommand({
      TableName: usersTable,
      Item: {
        userId: claims.sub,
        lastSeenAt: new Date().toISOString(),
        name: profile.name,
        email: profile.email
      }
    }));

    return json(200, profile);
  } catch (error) {
    if (String(error.message).includes('scope')) {
      return json(403, { message: error.message });
    }
    if (String(error.message).includes('token')) {
      return json(401, { message: error.message });
    }
    return json(500, { message: 'Internal server error', detail: error.message });
  }
};
