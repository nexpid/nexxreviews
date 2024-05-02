export function makeAvatar(
  id: string,
  discriminator: string | null,
  avatar: string | null
) {
  if (avatar)
    return `https://cdn.discordapp.com/avatars/${id}/${avatar}.${
      avatar.startsWith("a_") ? "gif" : "png"
    }?size=64`;
  else
    return `https://cdn.discordapp.com/embed/avatars/${
      discriminator ? Number(discriminator) % 5 : (Number(id) >> 22) % 6
    }.png`;
}
