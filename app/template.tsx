/**
 * The root template is remounted by the router on every navigation (unlike a
 * layout), so the wrapper animation and the progress sweep replay on each page
 * change without any JavaScript.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <>
      <span className="vs-route__sweep" aria-hidden="true" />
      <div className="vs-route">{children}</div>
    </>
  );
}
