import { Suspense } from "react";
import { AuthForm } from "../AuthForm";

export const metadata = { title: "Criar conta · DOITFORMS" };

export default function SignupPage() {
  return (
    <Suspense>
      <AuthForm mode="signup" />
    </Suspense>
  );
}
