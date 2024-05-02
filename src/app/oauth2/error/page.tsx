export default function Page({
  searchParams: { message },
}: {
  searchParams: { message?: string };
}) {
  return (
    <h1 className="text-5xl text-red-500">
      {message ?? "An unknown error occured while authenticating"}
    </h1>
  );
}
