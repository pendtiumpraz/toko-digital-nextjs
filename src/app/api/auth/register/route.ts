import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Store from '@/models/Store';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, phone, storeName, subdomain } = await request.json();

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Check if subdomain exists
    const existingSubdomain = await Store.findOne({ subdomain });
    if (existingSubdomain) {
      return NextResponse.json(
        { error: 'Subdomain already taken' },
        { status: 400 }
      );
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: 'store_owner'
    });

    // Create store
    const store = await Store.create({
      owner: user._id,
      name: storeName || `${name}'s Store`,
      subdomain,
      whatsappNumber: phone,
      email
    });

    // Update user with store reference
    user.store = store._id;
    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '30d' }
    );

    // Create response with token
    const response = NextResponse.json({
      success: true,
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          store: store._id
        },
        token
      }
    });

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    return response;
  } catch (error: any) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}