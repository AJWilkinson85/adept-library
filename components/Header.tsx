import Link from "next/link";
import { currentEmail } from "@/auth";
import { isAdmin } from "@/lib/access";
import { signOutAction } from "@/lib/actions";

export async function Header() {
  const email = await currentEmail();
  return (
    <header className="header">
      <div className="wrap header__inner">
        <Link href={email ? "/library" : "/"} className="wordmark" aria-label="Adept Advisors, The Library">
          <span className="diamond" aria-hidden="true" />
          <span>
            ADEPT <span className="wordmark__accent">ADVISORS</span>
          </span>
          <span className="wordmark__sub">Library</span>
        </Link>
        <nav className="nav" aria-label="Primary">
          {email ? (
            <>
              <Link href="/library">Library</Link>
              <Link href="/account">Account</Link>
              {isAdmin(email) && <Link href="/admin">Admin</Link>}
              <form action={signOutAction}>
                <button type="submit" className="linkbtn">
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/join">Join</Link>
              <Link href="/login">Sign in</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
