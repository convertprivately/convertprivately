export function Header() {
  return (
    <nav className="container max-w-[900px] p-10 lg:p-6 mx-auto mt-10 mb-10">
      <ul
        style={{
          display: "flex",
          flexDirection: "column",
          padding: "0",
          margin: "0",
          listStyle: "none",
        }}
      >
        <li>
          <a href="/">
            <p className="text-3xl text-white font-bold">
              ConvertPrivately
            </p>
          </a>
          <br />
          <br />
          <p className="text-md text-zinc-300">
            No clouds, no servers.
            <br />
            Convert video to audio, or audio to audio, privately, in lightning speed.
          </p>
        </li>
        <li> </li>
      </ul>
      <div className="border-b border-gray-700  mx-auto items-center flex mb-5 mt-5"></div>

    </nav>
  );
}
