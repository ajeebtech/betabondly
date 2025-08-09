import { currentUser } from "@clerk/nextjs"
import Link from "next/link"

export default async function Dashboard() {
  const user = await currentUser()
  if (!user) return <div>Please sign in</div>

  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold">Welcome, {user.firstName}</h1>
      <p className="mb-4">Manage your couple space here.</p>
      <Link href="/couple/my-slug" className="text-lovePink underline">
        Go to Couple Page
      </Link>
    </main>
  )
}
