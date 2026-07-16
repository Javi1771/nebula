import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/ProfileForm";

export default async function AccountProfilePage() {
  const user = await requireUser();

  return (
    <ProfileForm name={user.name} email={user.email} avatarUrl={user.avatar_url} balance={user.balance} />
  );
}
