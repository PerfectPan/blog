import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"

import { rhythm, scale } from "../utils/typography"

class Layout extends React.Component {
  render() {
    const { location, title, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    const blogPath = `${__PATH_PREFIX__}/blog/`
    let header

    const liStyle = {
      marginLeft: `0.5rem`,
      marginRight: `0.5rem`,
      marginBottom: `0rem`,
      display: `block`,
      lineHeight: `4rem`,
      color: `#48434f`,
    }

    if (location.pathname === rootPath || location.pathname === blogPath) {
      header = (
        <div
          style={{
            marginLeft: `24px`,
            marginRight: `24px`,
          }}
        >
          <nav>
            <ul
              style={{
                listStyle: `none`,
                margin: `0rem`,
                display: `flex`,
                alignSelf: `flex-end`,
                height: `4rem`,
              }}
            >
              <li style={liStyle}>
                <Link
                  style={{
                    boxShadow: `none`,
                    textDecoration: `none`,
                    color: `inherit`,
                  }}
                  to={`/`}
                >
                  Home
                </Link>
              </li>
              <li style={liStyle}>
                <Link
                  style={{
                    boxShadow: `none`,
                    textDecoration: `none`,
                    color: `inherit`,
                  }}
                  to={`/blog/`}
                >
                  Blog
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      )
    } else {
      header = (
        <h3
          style={{
            fontFamily: `Montserrat, sans-serif`,
            marginTop: 0,
          }}
        >
          <Link
            style={{
              boxShadow: `none`,
              textDecoration: `none`,
              color: `inherit`,
            }}
            to={`/blog/`}
          >
            {title}
          </Link>
        </h3>
      )
    }
    return (
      <Wrapper>
        <header
          style={{
            position: `fixed`,
            top: `0rem`,
            left: `0rem`,
            right: `0rem`,
            height: `4rem`,
            backgroundColor: `rgba(255,255,255,0.985)`,
            borderBottom: `1px solid #F0F0F2`,
            zIndex: `5`,
          }}
        >
          {header}
        </header>
        <div
          style={{
            marginLeft: `auto`,
            marginRight: `auto`,
            maxWidth: rhythm(24),
            padding: `${rhythm(1.5)} ${rhythm(3 / 4)}`,
            marginTop: `4rem`,
          }}
        >
          {/* <header>{header}</header> */}
          <main>{children}</main>
        </div>
        <Footer>
          © {new Date().getFullYear()}, Built with
          {` `}
          <a href="https://www.gatsbyjs.org">Gatsby</a>
        </Footer>
      </Wrapper>
    )
  }
}

const Wrapper = styled.div`
  min-height: 100vh;
`

const Footer = styled.footer`
  text-align: center;
  margin: 24px;
`

export default Layout
