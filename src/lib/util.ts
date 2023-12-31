export function avatarFallback(name: string) {
  return name
    .split(/ +/g)
    .filter((x) => x.match(/^[a-z0-9]/i))
    .map((x) => x[0])
    .join("");
}
