import AuthGate from "@/components/AuthGate";
import AuthButtons from "@/components/AuthButtons";
import Composer from "@/components/Composer";

export default function Home() {
  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <AuthGate fallback={<AuthButtons />}>
        <Composer />
        <div className="opacity-70 text-sm">Feed coming next…</div>
      </AuthGate>
    </div>
  );
}
