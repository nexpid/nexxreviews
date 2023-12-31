import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/shadcn/ui/alert";
import { BanIcon } from "lucide-react";

export default function Fallback() {
  return (
    <Alert variant="destructive" className="w-[40rem] max-w-full">
      <BanIcon className="w-4 h-4" />
      <AlertTitle>Suspended</AlertTitle>
      <AlertDescription>
        Your account has been suspended. You may no longer post reviews
      </AlertDescription>
    </Alert>
  );
}
