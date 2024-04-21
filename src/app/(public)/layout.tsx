import SettingsContextProvider from "@/contexts/settings-context-provider";
import CoverImageContextProvider from "@/contexts/cover-image-provider";
import DocumentContextProvider from "@/contexts/document-context-provider";

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return <div className="h-full dark:bg-[#1F1F1F]">{children}</div>;
};

export default PublicLayout;
