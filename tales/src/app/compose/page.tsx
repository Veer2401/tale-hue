import AuthGate from "@/components/AuthGate";
import Composer from "@/components/Composer";

export default function ComposePage() {
  return (
    <div className="max-w-2xl mx-auto">
      <AuthGate>
        <Composer />
      </AuthGate>
    </div>
  );
}


