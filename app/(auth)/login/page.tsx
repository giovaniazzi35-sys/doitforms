import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export const metadata = { title: "Entrar · doitforms" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
