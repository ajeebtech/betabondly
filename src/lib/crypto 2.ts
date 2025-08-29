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
    function pemToArrayBuffer(pem: string): ArrayBuffer {
      const b64 = pem.replace(/-----.*?-----/g, "").replace(/\s/g, "");
      const byteString = atob(b64);
      const byteArray = new Uint8Array(byteString.length);
      for (let i = 0; i < byteString.length; i++) {
        byteArray[i] = byteString.charCodeAt(i);
      }
      return byteArray.buffer;
    }
  
    const spki = pemToArrayBuffer(serverPublicPem);
    const pubKey = await crypto.subtle.importKey(
      "spki",
      spki,
      { name: "RSA-OAEP", hash: "SHA-256" },
      false,
      ["encrypt"]
    );
  
    // Create a new ArrayBuffer from the Uint8Array to ensure proper type
    const rawKeyBuffer = new Uint8Array(rawKey).buffer;
    const encrypted = await crypto.subtle.encrypt(
      { name: "RSA-OAEP" }, 
      pubKey, 
      rawKeyBuffer
    );
    return btoa(String.fromCharCode(...new Uint8Array(encrypted))); // base64
  }
  