// db.js - IndexedDB Utility
export const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("InvalidCIDDB", 1);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("invalidCIDs")) {
                db.createObjectStore("invalidCIDs", { keyPath: "cid" });
            }
        };
        request.onsuccess = (event) => {
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            reject("Error initializing IndexedDB: " + event.target.errorCode);
        };
    });
};

export const saveInvalidCID = async (cid) => {
    const db = await initDB();
    const transaction = db.transaction(["invalidCIDs"], "readwrite");
    const store = transaction.objectStore("invalidCIDs");
    store.put({ cid });
};

export const getInvalidCIDs = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(["invalidCIDs"], "readonly");
        const store = transaction.objectStore("invalidCIDs");
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result.map((item) => item.cid));
        request.onerror = () => reject("Error fetching CIDs from IndexedDB.");
    });
};
