"""Health check endpoint for Vercel."""

import json


def handler(request):
    """Health check serverless function handler."""
    return {
        'statusCode': 200,
        'headers': {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': 'application/json'
        },
        'body': json.dumps({'status': 'healthy'})
    }
