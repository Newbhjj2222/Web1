'use client';
import Head from "next/head";
import React from "react";
import { useRouter } from "next/navigation";
import { db } from "../components/firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import styles from "../components/index.module.css";

// Server-side data fetching
export async function getServerSideProps() {
  try {
    const trendingSnapshot = await getDocs(
      query(collection(db, "posts"), orderBy("createdAt", "desc"))
    );

    const trendingPosts = trendingSnapshot.docs.map((doc) => {
      const data = doc.data();
      const summary = data.story
        ? data.story.replace(/<[^>]+>/g, "").split(" ").slice(0, 20).join(" ") + "..."
        : "";
      return {
        id: doc.id,
        image: data.imageUrl || "",
        title: data.head || "Untitled",
        summary,
        author: data.author || "Unknown",
      };
    });

    return {
      props: {
        trendingPosts,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      props: {
        trendingPosts: [],
      },
    };
  }
}

// React Component
export default function Home({ trendingPosts }) {
  const router = useRouter();

  const handlePostClick = (id) => {
    router.push(`/post/${id}`);
  };

  return (
    <>
      <Head>
        <title>All Stories</title>
        <meta name="description" content="Explore all stories" />
      </Head>

      <div className={styles.page}>
        <main className={styles.mainContent}>
          <h1 className={styles.pageTitle}>All Stories</h1>

          {trendingPosts.length === 0 && (
            <p className={styles.noPosts}>No posts available.</p>
          )}

          <div className={styles.postsGrid}>
            {trendingPosts.map((post) => (
              <div
                key={post.id}
                className={styles.postCard}
                onClick={() => handlePostClick(post.id)}
              >
                {post.image && (
                  <img
                    src={post.image}
                    alt={post.title}
                    className={styles.postImage}
                  />
                )}
                <div className={styles.postContent}>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postSummary}>{post.summary}</p>
                  <small className={styles.authorText}>
                    By {post.author}
                  </small>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </>
  );
}
