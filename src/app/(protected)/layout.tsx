import { getDocuments } from "@/actions/actions";
import DocumentContextProvider from "@/contexts/document-context-provider";
import { Navigation } from "./app/_components/navigation";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const documents = await getDocuments();
  return (
    <DocumentContextProvider data={documents}>
      <div className="h-full flex dark:bg-[#1F1F1F]">
        <Navigation />
        <main className="flex-1 h-full overflow-y-auto">{children}</main>
      </div>
    </DocumentContextProvider>
  );
};

export default MainLayout;
