import React, { Component } from "react"
import { Link } from "gatsby"
import { rhythm } from "../utils/typography"
import "./box-style.css"

class Box extends Component {
  render() {
    const { node } = this.props
    const title = node.frontmatter.title || node.fields.slug
    const h3Style = {
      marginBottom: rhythm(1 / 2),
      marginTop: 0,
    }

    return (
      <div className="box-outside">
        <h3 style={h3Style}>
          <Link style={{ boxShadow: `none` }} to={`blog${node.fields.slug}`}>
            {title}
          </Link>
        </h3>
        <p
          style={{ marginBottom: rhythm(1 / 4) }}
          dangerouslySetInnerHTML={{
            __html: node.frontmatter.description || node.excerpt,
          }}
        />
        <small>Written on {node.frontmatter.date}</small>
      </div>
    )
  }
}

export default Box
