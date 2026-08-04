import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export const metadata = { title: "Entrar · DOITFORMS" };

export default function LoginPage() {
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
