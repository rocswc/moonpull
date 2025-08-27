import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { Document, Page } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type Props = {
  open: boolean;
  onClose: () => void;
  fileUrl: string;
};

const DocumentModal = ({ open, onClose, fileUrl }: Props) => {
  const [numPages, setNumPages] = useState<number | null>(null);

  const isPDF = fileUrl.toLowerCase().endsWith(".pdf");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>첨부 서류 보기</DialogTitle>
        </DialogHeader>

        {isPDF ? (
          <div className="flex flex-col items-center overflow-auto max-h-[80vh]">
            <Document
              file={fileUrl}
              onLoadSuccess={({ numPages }) => setNumPages(numPages)}
              onLoadError={(err) => {
                console.error("PDF 로딩 실패", err);
              }}
              options={{
                withCredentials: true,
                // ✅ 최신 버전에 맞는 cMapUrl (또는 제거해도 됨)
                cMapUrl: `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/`,
                cMapPacked: true,
              }}
            >
              {Array.from(new Array(numPages), (_, index) => (
                <Page key={`page_${index + 1}`} pageNumber={index + 1} width={800} />
              ))}
            </Document>
          </div>
        ) : (
          <div className="flex justify-center">
            <img
              src={fileUrl}
              alt="첨부 이미지"
              className="max-h-[700px] rounded-lg shadow-md"
            />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default DocumentModal;
