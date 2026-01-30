// // middleware.ts
// import { getServerSession } from 'next-auth';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
// import { authOptions } from './app/api/auth/[...nextauth]/route';

// export async function middleware(request: NextRequest) {
//     const session = await getServerSession(authOptions);

//   if (!session) {
//     return NextResponse.redirect(new URL('/login', request.url));
//   }
// }

// export const config = {
//   matcher: ['/'],
// };
