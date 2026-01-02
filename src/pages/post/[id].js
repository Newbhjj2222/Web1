'use client';
import React, { useState, useEffect } from "react";
import Head from "next/head";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { db } from "../../components/firebase";
import { doc, getDoc } from "firebase/firestore";
import styles from "../../styles/PostPage.module.css";
import { FaShareAlt } from "react-icons/fa";

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const docRef = doc(db, "posts", id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return { notFound: true };
    }

    const data = docSnap.data();
    const summary = data.story
      ? data.story.replace(/<[^>]+>/g, "").split(" ").slice(0, 20).join(" ") + "..."
      : "";

    return {
      props: {
        post: {
          id: docSnap.id,
          title: data.head || "Untitled",
          image: data.imageUrl || "",
          story: data.story || "",
          author: data.author || "Unknown",
          categories: data.categories || ["General"],
          summary,
        },
      },
    };
  } catch (error) {
    console.error(error);
    return { notFound: true };
  }
}

export default function PostPage({ post }) {
  const [comment, setComment] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Get dynamic URL on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(`${window.location.origin}${pathname}`);
    }
  }, [pathname]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: post.title,
          text: post.summary,
          url: currentUrl,
        })
        .catch((err) => console.error(err));
    } else {
      alert("Sharing not supported on this browser.");
    }
  };

  const handleCommentSubmit = () => {
    if (comment.trim() === "") return;
    alert("Comment submitted: " + comment);
    setComment("");
  };

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.summary} />
        <link rel="canonical" href={currentUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.summary} />
        <meta property="og:url" content={currentUrl} />
        {post.image && <meta property="og:image" content={post.image} />}
        {post.categories.map((cat, i) => (
          <meta key={i} property="article:tag" content={cat} />
        ))}
      </Head>

      <div className={styles.page}>
        {post.image && (
          <img src={post.image} alt={post.title} className={styles.postImage} />
        )}

        <div className={styles.postContent}>
          <h1 className={styles.postTitle}>{post.title}</h1>
          <small className={styles.authorText}>By {post.author}</small>

          <div
            className={styles.postStory}
            dangerouslySetInnerHTML={{ __html: post.story }}
          />

          <div className={styles.tagsWrapper}>
            {post.categories.map((cat, i) => (
              <span key={i} className={styles.tag}>
                {cat}
              </span>
            ))}
          </div>

          <div className={styles.actionsWrapper}>
            <button className={styles.shareBtn} onClick={handleShare}>
              <FaShareAlt /> Share
            </button>
          </div>

          <div className={styles.commentWrapper}>
            <h3>Comments</h3>
            <textarea
              placeholder="Type your comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className={styles.commentInput}
            />
            <button className={styles.commentBtn} onClick={handleCommentSubmit}>
              Submit
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
