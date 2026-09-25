import type { Metadata } from "next";
import "./globals.css";
import "./responsive.css";
import "./accessibility.css";
import "./quotation-workspace.css";
import "./ats-document.css";
import "./ats-document-editor.css";
import "./ats-reference-match.css";
import "./quote-fields.css";
import "./parts-workspace.css";
import "./quotation-image-designer.css";
import "./quotation-print.css";
import "./quotation-reference.css";
import "./saved-quotation.css";
import "./feedback.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "AUTO-TECHSYSTEM | ERP",
  description: "Industrial ERP demonstration",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
