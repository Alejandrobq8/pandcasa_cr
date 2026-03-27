export const config = {
  runtime: 'nodejs',
  matcher: ['/admin/:path*']
};

const unauthorized = () =>
  new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': "Basic realm=\"Pan d' Casa Admin\", charset=\"UTF-8\""
    }
  });

export default function middleware(request) {
  const gateUser = process.env.ADMIN_GATE_USER;
  const gatePass = process.env.ADMIN_GATE_PASS;

  if (!gateUser || !gatePass) {
    return;
  }

  const authorization = request.headers.get('authorization');
  if (!authorization || !authorization.startsWith('Basic ')) {
    return unauthorized();
  }

  let decoded = '';
  try {
    decoded = Buffer.from(authorization.slice(6), 'base64').toString('utf8');
  } catch (error) {
    return unauthorized();
  }

  const separatorIndex = decoded.indexOf(':');
  if (separatorIndex === -1) {
    return unauthorized();
  }

  const username = decoded.slice(0, separatorIndex);
  const password = decoded.slice(separatorIndex + 1);

  if (username !== gateUser || password !== gatePass) {
    return unauthorized();
  }
}
