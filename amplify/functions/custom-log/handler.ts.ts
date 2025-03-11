import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

interface LogEvent {
  message: string;
  timestamp: number;
  level: 'INFO' | 'WARN' | 'ERROR';
  metadata?: Record<string, unknown>;
}

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // リクエストボディのパース
    const logEvent: LogEvent = event.body ? JSON.parse(event.body) : null;

    if (!logEvent || !logEvent.message) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'Invalid request body. Message is required.',
        }),
      };
    }

    // ログの記録
    console.log('Log Event:', {
      message: logEvent.message,
      timestamp: logEvent.timestamp || Date.now(),
      level: logEvent.level || 'INFO',
      metadata: logEvent.metadata || {},
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: 'Log recorded successfully',
        timestamp: new Date().toISOString(),
      }),
    };

  } catch (error) {
    console.error('Error processing log:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
    };
  }
};
