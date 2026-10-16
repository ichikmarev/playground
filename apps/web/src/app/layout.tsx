import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Zapp Interview",
	description: "Zapp interview project",
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body className="min-h-screen antialiased">
				<header className="border-b">
					<nav className="container mx-auto flex items-center gap-6 px-4 py-3">
						<a href="/" className="text-lg font-bold">
							Zapp
						</a>
						<a
							href="/users"
							className="text-muted-foreground hover:text-foreground"
						>
							Users
						</a>
						<a
							href="/products"
							className="text-muted-foreground hover:text-foreground"
						>
							Products
						</a>
					</nav>
				</header>
				<main className="container mx-auto px-4 py-8">{children}</main>
			</body>
		</html>
	);
}
