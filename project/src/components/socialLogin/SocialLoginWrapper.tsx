import Navigation from "@/components/Navigation";
import { useParams } from "react-router-dom";
import SocialPhoneModal from "./SocialPhoneModal";

export default function SocialLoginWrapper() {
  const { provider } = useParams();
  return (
    <>
      <Navigation />
      <SocialPhoneModal provider={(provider || "").toUpperCase()} />
    </>
  );
}
