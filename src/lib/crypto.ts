// utils/crypto.ts (client)
export async function generateAesKeyAndEncryptFile(file: File) {
    const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, true, ["encrypt", "decrypt"]);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const fileBuf = await file.arrayBuffer();
    const encrypted = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, fileBuf);
  
    // export raw key
    const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
    return {
      encryptedBlob: new Blob([encrypted], { type: file.type }),
      iv: Array.from(iv), // or base64
      rawKey: rawKey // Uint8Array
    };
  }
  
  // RSA encrypt rawKey with server public key (PEM)
  export async function rsaEncryptRawKey(rawKey: Uint8Array, serverPublicPem: string) {
    // convert PEM to CryptoKey and encrypt with RSA-OAEP
    function pemToArrayBuffer(pem: string) {
      const b64 = pem.replace(/-----.*?-----/g, "").replace(/\s/g, "");
      return Uint8Array.from(atob(b64), c => c.charCodeAt(0)).buffer;
    }
  
    const spki = pemToArrayBuffer(serverPublicPem);
    const pubKey = await crypto.subtle.importKey(
      "spki",
      spki,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
  
    const encrypted = await crypto.subtle.encrypt({ name: "RSA-OAEP" }, pubKey, rawKey);
    return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // base64
  }
  