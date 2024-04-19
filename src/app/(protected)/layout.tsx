import { getDocuments } from "@/actions/actions";
import DocumentContextProvider from "@/contexts/document-context-provider";
import SearchContextProvider from "@/contexts/search-context-provider";
import SettingsContextProvider from "@/contexts/settings-context-provider";
import CoverImageContextProvider from "@/contexts/cover-image-provider";
import { ModalProvider } from "@/components/providers/modal-provider";
import { SearchCommand } from "@/components/search-command";
import { Navigation } from "./app/_components/navigation";

const MainLayout = async ({ children }: { children: React.ReactNode }) => {
  const documents = await getDocuments();
  return (
    <SearchContextProvider>
      <SettingsContextProvider>
        <CoverImageContextProvider>
          <DocumentContextProvider data={documents}>
            <div className="h-full flex dark:bg-[#1F1F1F]">
              <Navigation />
              <main className="flex-1 h-full overflow-y-auto">
                <SearchCommand />
                <ModalProvider />
                {children}
              </main>
            </div>
          </DocumentContextProvider>
        </CoverImageContextProvider>
      </SettingsContextProvider>
    </SearchContextProvider>
  );
};

export default MainLayout;
