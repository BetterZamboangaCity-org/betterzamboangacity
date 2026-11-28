export function civicJsonResponse(data: unknown): Response {
  return Response.json(data, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=0, must-revalidate',
    },
  });
}
