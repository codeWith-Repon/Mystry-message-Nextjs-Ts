import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import bcrypt from 'bcryptjs'

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import { request } from "http";

export async function POST(request: Request) {

    try {
        const { username, email, password } = await request.json()

    } catch (error) {
        console.error("Error registering user", error)
        return Response.json({
            success: false,
            message: "Error registerin user"
        }, {
            status: 500
        })
    }
}