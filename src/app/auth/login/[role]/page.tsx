import { redirect } from "next/navigation";

export default function LoginRolePage() {
  redirect("/auth/login");
}