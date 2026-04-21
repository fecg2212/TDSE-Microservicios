import { randomUUID } from 'node:crypto';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { json, verifyAccessToken } from './auth.js';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.POSTS_TABLE;

export const createPost = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return json(200, { ok: true });
  }

  try {
    const claims = await verifyAccessToken(event, 'write:posts');
    const payload = JSON.parse(event.body || '{}');
    const content = String(payload.content || '').trim();

    if (!content) {
      return json(400, { message: 'Post content cannot be blank' });
    }

    if (content.length > 140) {
      return json(400, { message: 'Post must be at most 140 characters' });
    }

    const post = {
      id: randomUUID(),
      userId: claims.sub,
      username: claims.name || claims.nickname || 'anonymous',
      content,
      createdAt: new Date().toISOString()
    };

    await db.send(new PutCommand({
      TableName: tableName,
      Item: post
    }));

    return json(201, post);
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
