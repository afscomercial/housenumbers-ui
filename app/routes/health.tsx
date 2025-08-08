import { json } from '@remix-run/node';

export async function loader() {
  return json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    service: 'housenumbers-ui'
  });
}