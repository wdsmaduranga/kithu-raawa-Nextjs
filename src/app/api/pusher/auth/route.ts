import { NextResponse } from 'next/server';
import Pusher from 'pusher';
import { cookies } from 'next/headers';

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_APP_KEY!,
  secret: process.env.PUSHER_APP_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_APP_CLUSTER!,
  useTLS: true,
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const socketId = data.get('socket_id') as string;
    const channelName = data.get('channel_name') as string;
    
    // Get the token from cookies
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Verify token with your Laravel backend
    const userResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!userResponse.ok) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await userResponse.json();

    // For presence channels
    if (channelName.startsWith('presence-')) {
      const presenceData = {
        user_id: user.id,
        user_info: {
          name: user.first_name + ' ' + user.last_name,
          email: user.email,
        },
      };

      const auth = pusher.authorizeChannel(socketId, channelName, presenceData);
      return NextResponse.json(auth);
    }

    // For private channels
    const auth = pusher.authorizeChannel(socketId, channelName);
    return NextResponse.json(auth);

  } catch (error) {
    console.error('Pusher Auth Error:', error);
    return new NextResponse('Error', { status: 500 });
  }
} 