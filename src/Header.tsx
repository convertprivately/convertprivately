export function Header() {
  return (
    <nav className="container max-w-[900px] px-10 lg:px-4"  style={{paddingTop: "1em"}}>
      <ul
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "0",
        margin: "0",
        listStyle: "none",
      
      }}>
        <li >
          
          <a href="/"><p className="text-3xl text-primaryColor font-bold">PrivateConverter</p></a>
        <br/><br/>
        <p className="text-md">No clouds, no servers.        
<br/>
Convert video to audio, privately, in lightning speed.</p>
  </li>
        <li> </li>
      </ul>
    </nav>
  );
}