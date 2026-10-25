import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@qreet.com";
  const password = process.env.ADMIN_PASSWORD ?? "admin12345";

  await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Qreet Admin",
      role: "admin",
      passwordHash: await bcrypt.hash(password, 10),
    },
  });

  await prisma.setting.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteName: "Qreet",
      defaultSeoTitle: "Qreet — Personalized messages made simple",
      defaultSeoDescription:
        "Create, share and manage personalized QR messages for your business.",
      socialLinks: { twitter: "", instagram: "", linkedin: "" },
    },
  });

  const author = await prisma.author.upsert({
    where: { slug: "qreet-team" },
    update: {},
    create: { name: "Qreet Team", slug: "qreet-team", bio: "The Qreet content team." },
  });

  const category = await prisma.category.upsert({
    where: { slug: "product"},
    update: {},
    create: {
      name: "Product",
      slug: "product",
      description: "Product news and deep-dives from Qreet.",
    },
  });

  await prisma.post.upsert({
    where: { slug: "how-qr-codes-can-improve-customer-experience" },
    update: {},
    create: {
      title: "How QR Codes Can Improve Customer Experience",
      slug: "how-qr-codes-can-improve-customer-experience",
      excerpt:
        "Customers increasingly expect instant, personalized experiences. Here is how QR codes close the gap.",
      content:
        "<p>Customers increasingly expect instant, personalized experiences. QR codes quietly power a surprising amount of that.</p><h2>Why QR codes matter</h2><p>A scannable code removes friction: no typing URLs, no searching for a menu, no downloading an app.</p><ul><li>Instant access to the exact page a customer needs</li><li>Personalized messages per scan</li><li>Measurable engagement</li></ul><blockquote>The best interface is the one your customer never has to think about.</blockquote>",
      authorId: author.id,
      categoryId: category.id,
      status: "PUBLISHED",
      publishedAt: new Date(),
      seoTitle: "How QR Codes Can Improve Customer Experience",
      seoDescription:
        "Practical ways QR codes reduce friction and personalize the customer journey.",
    },
  });

  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      title: "About Qreet",
      slug: "about",
      status: "PUBLISHED",
      publishedAt: new Date(),
      html: `<section class="hero">
  <div class="container">
    <h1>Personalized messages made simple</h1>
    <p>Qreet turns every QR scan into a personal moment for your customers.</p>
  </div>
</section>`,
      css: `.hero { padding: 120px 0; background: #0b0f19; color: #fff; }
.hero h1 { font-size: 64px; margin: 0 0 16px; }
.hero p { font-size: 20px; opacity: .8; }
.container { max-width: 1100px; margin: 0 auto; padding: 0 24px; }`,
      seoTitle: "About Qreet",
      seoDescription: "Learn who Qreet is and what we build.",
    },
  });

  console.log("Seed complete. Login with", email, "/", password);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
