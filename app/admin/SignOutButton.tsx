// app/admin/SignOutButton.tsx
'use client';
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/client";
import { faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";

export default function SignOutButton() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <Button variant="ghost" size="icon" onClick={handleLogout}>
      <FontAwesomeIcon icon={faSignOutAlt} className="text-xl text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white" />
    </Button>
  );
}