import React, { useRef, useEffect, useState } from "react"
import PropTypes from "prop-types"

const Utterances = React.memo(({ slug }) => {
  const [loaded, setLoaded] = useState(false)
  const utterancesRef = useRef()
  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }
    setLoaded(false)
    const el = document.createElement("script")
    if (utterancesRef.current) {
      el.src = "https://utteranc.es/client.js"
      el.async = true
      el.setAttribute("repo", "PerfectPan/blog")
      el.setAttribute("issue-term", encodeURIComponent(slug));
      el.setAttribute("label", "Comment")
      el.setAttribute("theme", "github-light")
      el.setAttribute("crossorigin", "anonymous")
      el.onload = () => {
        setLoaded(true)
      }
      utterancesRef.current.appendChild(el)
    }
    return () => {
      el.remove()
    }
  }, [slug])

  return (
    <section key={slug} className="section" ref={utterancesRef}>
      {loaded || (
        <div>Cannot load comments. Please check you network.</div>
      )}
    </section>
  )
})

Utterances.propTypes = {
  slug: PropTypes.string.isRequired,
}

export default Utterances
