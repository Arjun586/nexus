import * as Y from "yjs";
import { HocuspocusProvider } from "@hocuspocus/provider";

const doc = new Y.Doc();

const provider = new HocuspocusProvider({
    url: "ws://localhost:1234",
    name: "test-document",
    document: doc,
});

const sharedMap = doc.getMap<string>("test");

provider.on("connect", () => {
    console.log("Connected");
});

provider.on("synced", () => {
    console.log("Synced");

    console.log("Current value:", sharedMap.get("message"));
});

sharedMap.observe(() => {
    console.log("Shared state changed:", sharedMap.get("message"));
});

(window as typeof window & {
    setSharedMessage?: (message: string) => void;
}).setSharedMessage = (message: string) => {
    sharedMap.set("message", message);
};