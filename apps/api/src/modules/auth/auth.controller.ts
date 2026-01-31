import { Body, Controller, Post } from "@nestjs/common";

@Controller("auth")
export class AuthController {
  @Post("login")
  login(@Body() body: { email: string; password: string }) {
    return {
      message: "Login placeholder",
      email: body.email,
    };
  }

  @Post("guest")
  guestCheckout(@Body() body: { email?: string }) {
    return {
      message: "Guest checkout placeholder",
      email: body.email ?? null,
    };
  }
}
