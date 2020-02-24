import React from "react"
import { Link } from "gatsby"
import styled from "styled-components"

import { rhythm, scale } from "../utils/typography"
import "./layout-style.css"

class Layout extends React.Component {
  render() {
    const { location, children } = this.props
    const rootPath = `${__PATH_PREFIX__}/`
    const blogPath = `${__PATH_PREFIX__}/blog/`
    let header

    const title = "PerfectPan";
    // if (location.pathname === rootPath || location.pathname === blogPath) {
      header = (
        <div
          style={{
            marginLeft: `24px`,
            marginRight: `24px`,
          }}
        >
          <span className="header-title">{title}</span>
          <nav>
            <ul className="nav-ul">
              <li className={location.pathname === rootPath ? "nav-li active" : "nav-li"}>
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
              <li className={location.pathname === rootPath ? "nav-li " : "nav-li active"}>
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
    // } else {
    //   header = (
    //     <h3
    //       style={{
    //         fontFamily: `Montserrat, sans-serif`,
    //         marginTop: 0,
    //       }}
    //     >
    //       <Link
    //         style={{
    //           boxShadow: `none`,
    //           textDecoration: `none`,
    //           color: `inherit`,
    //         }}
    //         to={`/blog/`}
    //       >
    //         {title}
    //       </Link>
    //     </h3>
    //   )
    // }
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
            boxShadow: `0px 0px 8px rgba(14, 14, 14, 0.26)`,
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
