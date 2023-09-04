async function encryptData(data, key) {
  const textEncoder = new TextEncoder();
  const encodedData = textEncoder.encode(data);

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    'AES-GCM',
    true,
    ['encrypt']
  );

  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encodedData
  );

  return { iv, encryptedData };
}

async function decryptData(encryptedData, iv, key) {
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    'AES-GCM',
    true,
    ['decrypt']
  );

  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    encryptedData
  );

  const textDecoder = new TextDecoder();
  return textDecoder.decode(decryptedData);
}

// Example usage
const encryptionKey = new Uint8Array([/* your encryption key here */]);
const originalData = 'Sensitive data';

encryptData(originalData, encryptionKey)
  .then(({ iv, encryptedData }) => {
    // Store `iv` and `encryptedData` in localStorage
    localStorage.setItem('iv', JSON.stringify([...iv]));
    localStorage.setItem('encryptedData', JSON.stringify([...encryptedData]));

    // Later, when you need to decrypt the data
    const storedIv = new Uint8Array(JSON.parse(localStorage.getItem('iv')));
    const storedEncryptedData = new Uint8Array(JSON.parse(localStorage.getItem('encryptedData')));
    decryptData(storedEncryptedData, storedIv, encryptionKey)
      .then(decryptedData => {
        // console.log('Decrypted data:', decryptedData);
      })
      .catch(error => {
        // console.error('Decryption error:', error);
      });
  })
  .catch(error => {
    // console.error('Encryption error:', error);
  });
