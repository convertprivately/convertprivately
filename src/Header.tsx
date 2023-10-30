export function Header() {
  return (
    <nav className="container" style={{padding: "1em"}}>
      <ul>
        <li><a href="/"><h3 style={{margin: 0}}>QuickLodge</h3></a></li>
      </ul>
      <ul style={{gap: "2em"}}>
        <li><a href="/audio">Extract Audio</a></li>
        <li><a href="/spaces">Twitter Spaces</a></li>
        {/* <li><a href="#">Link</a></li> */}
        {/* <li><a href="#" role="button">Button</a></li> */}
      </ul>
    </nav>
  );
}