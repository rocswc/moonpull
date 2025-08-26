import Navigation from "@/components/Navigation";
import { useParams } from "react-router-dom";
import { useState } from "react";
import SocialPhoneModal from "./SocialPhoneModal";

export default function SocialLoginWrapper() {
  const { provider } = useParams();
  const [modalOpen, setModalOpen] = useState(true); // 바로 열리게 하려면 true

  return (
    <>
      <Navigation />
      <SocialPhoneModal
        provider={(provider || "").toUpperCase()}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </>
  );
}
