export default function PageShell({ title, children }) {
  return (
    <main className="page">
      {title ? <h1 className="page-title">{title}</h1> : null}
      {children}
    </main>
  )
}