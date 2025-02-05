import { authorize } from "@/lib/authorize";
import { bc } from "@/lib/bc";
import { Panel } from "@/lib/big-design";

export default async function Home() {
  const storeUser = await authorize();

  const storeInformation = await bc.getStoreInformation(storeUser);

  return (
    <main className="container mx-auto flex flex-col space-y-4 p-4">
      <Panel header="BigCommerce Single Click App">
        <pre className="h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-50">
          {JSON.stringify(storeInformation, null, 2)}
        </pre>
      </Panel>
    </main>
  );
}
