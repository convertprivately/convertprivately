export default function Landing() {
  return (
    <div className="container" style={{width: "70%"}}>
      <div style={{display: "flex", flexDirection: "row", width: "100%", justifyContent: "space-between"}}>
        <div>
          Want the audio from a video?
          <br />
          <a href="/audio">Extract it here</a>
        </div>
        <div>
          Want to download a Twitter Space?
          <br />
          <a href="/spaces">Download it here</a>
        </div>
      </div>
      
    </div>
  )
}