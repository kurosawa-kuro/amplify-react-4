type LogEvent = {
  body: {
    message: string;
    timestamp: number;
    level: 'INFO' | 'WARN' | 'ERROR';
    metadata?: Record<string, unknown>;
  }
};

type Response = {
  statusCode: number;
  headers: {
    [key: string]: string;
  };
  body: string;
};

export const handler = async (event: LogEvent): Promise<Response> => {
  try {
    const logData = event.body;
    console.log('Log Event:', {
      message: logData.message,
      timestamp: logData.timestamp || Date.now(),
      level: logData.level || process.env.LOG_LEVEL || 'INFO',
      metadata: logData.metadata || {}
    });

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Log recorded successfully',
        timestamp: new Date().toISOString()
      })
    };
  } catch (error) {
    console.error('Error processing log:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}; 