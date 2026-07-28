import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

const doc = new Y.Doc();

const provider = new HocuspocusProvider({
    url: "ws://localhost:1234",
    name: "test-document",
    document: doc,
});

const sharedMap = doc.getMap<string>("test");

provider.on("connect", () => {});

provider.on("synced", () => {});

sharedMap.observe(() => {});

(window as typeof window & {
    setSharedMessage?: (message: string) => void;
}).setSharedMessage = (message: string) => {
    sharedMap.set("message", message);
};