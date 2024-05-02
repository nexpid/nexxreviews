const splitter = ".";

const makeHash = async (data: string) => {
  const val = new TextEncoder().encode(data);
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(process.env.hash_key!),
    {
      name: "HMAC",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  const signed = Array.from(
    new Uint8Array(await crypto.subtle.sign("HMAC", key, val))
  );
  return signed.map((x) => String.fromCharCode(x)).join("");
};

export async function unhash(cookie: string): Promise<string | undefined> {
  const [raw, ...rawBody] = cookie.split(splitter);
  const body = rawBody.join(splitter);

  const rhash = await makeHash(body);
  if (rhash !== raw) return;

  return body;
}

export async function hash(cookie: string): Promise<string> {
  return `${await makeHash(cookie)}${splitter}${cookie}`;
}
