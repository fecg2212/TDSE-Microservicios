import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { json } from './auth.js';

const db = DynamoDBDocumentClient.from(new DynamoDBClient({}));
const tableName = process.env.POSTS_TABLE;

export const getStream = async (event) => {
  if (event.requestContext?.http?.method === 'OPTIONS') {
    return json(200, { ok: true });
  }

  try {
    const result = await db.send(new ScanCommand({ TableName: tableName }));
    const posts = (result.Items || []).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    return json(200, {
      posts,
      totalPosts: posts.length
    });
  } catch (error) {
    return json(500, { message: 'Internal server error', detail: error.message });
  }
};
