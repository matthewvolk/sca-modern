import bigrequest from "bigrequest";

import { authorize } from "@/lib/authorize";
import { Panel } from "@/lib/big-design";

export default async function Home() {
  const storeUser = await authorize();

  const bc = bigrequest.rest({
    accessToken: storeUser.store.accessToken,
    storeHash: storeUser.store.storeHash,
  });

  const info = await bc.v2.GET("/store", {
    params: {
      header: {
        Accept: "application/json",
      },
    },
  });

  return (
    <main className="container mx-auto flex flex-col space-y-4 p-4">
      <Panel header="BigCommerce Single Click App">
        <pre className="h-96 overflow-auto rounded-lg bg-slate-900 p-4 text-sm text-slate-50">
          {JSON.stringify(info.data, null, 2)}
        </pre>
      </Panel>
    </main>
  );
}
