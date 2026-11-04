export default function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="post" className="logout-form">
      <button className="dashboard-logout" type="submit">Se déconnecter ↗</button>
    </form>
  )
}
