import React, { useState } from "react"
import { Link } from "gatsby"
import styled from "styled-components"

import { rhythm } from "../utils/typography"
import "./layout-style.css"

const BigImg = styled.section`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: space-between; 
  min-height: auto;
  position: relative;
`;

const Layout = (props) => {

  const { location, children, blogTitle = "", blogDate = "" } = props
  const [isCollapse, setIsCollapse] = useState(0);
  const rootPath = `${__PATH_PREFIX__}/`

  let header

  const title = "PerfectPan";
  // if (location.pathname === rootPath || location.pathname === blogPath) {
  header = (
    <div
      style={{
        marginLeft: `24px`,
        marginRight: `24px`,
        // display: `flex`
      }}
    >
      <span className="header-title">{title}</span>
      <a className="navbar-burger" onClick={() => setIsCollapse(isCollapse ^ 1)}>
        <span></span>
        <span></span>
        <span></span>
      </a>
      <nav>
        <ul className={isCollapse ? "nav-ul" : "nav-ul inactive"}>
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
      <div className="nav-social">
        <a href="https://github.com/PerfectPan" target="blank" className="social-icon">
          <img src="/github_logo.svg" title="github" />
        </a>
        <a href="https://www.zhihu.com/people/pan-yi-ming-2" target="blank" className="social-icon">
          <img src="/zhihu_logo.svg" title="知乎" />
        </a>
        <a href="/rss.xml" target="blank" className="social-icon">
          <img src="/RSS.svg" alt="RSS" />
        </a>
      </div>
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
          zIndex: `11`,
          boxShadow: `0px 0px 8px rgba(14, 14, 14, 0.26)`,
        }}
      >
        {header}
      </header>
      {
        blogTitle && blogDate ?
          <BigImg>
            <img
              src='/trianglify-lowres.png'
              aria-hidden='true'
              style={{
                position: `absolute`,
                top: `0`,
                left: `0`,
                width: `100%`,
                height: `100%`,
                objectFit: `cover`,
                objectPosition: `center`,
                zIndex: `-1000`,
                alt: `alt`
              }}
            />;
              <div
              style={{
                paddingTop: `9rem`,
                paddingBottom: `9rem`,
                zIndex: `10`,
                position: `relative`
              }}
            >
              <h1 style={{
                fontSize: `2rem`,
                fontWeight: `600`,
                color: `#363636`,
                lineHeight: `1.125`,
                textAlign: `center`
              }}>
                {blogTitle}
              </h1>
            </div>
            <div
              style={{
                textAlign: `center`,
                position: `relative`,
                zIndex: `10`,
                paddingTop: `0.5rem`,
                paddingBottom: `0.5rem`
              }}
            >
              <a
                style={{
                  display: `inline-block`,
                  textDecoration: `none`,
                  boxShadow: `none`,
                  color: `#363636`,
                }}
              >
                {blogDate}
              </a>
            </div>
          </BigImg>
          : null
      }
      <div
        style={{
          marginLeft: `auto`,
          marginRight: `auto`,
          maxWidth: rhythm(24),
          padding: `0 ${rhythm(3 / 4)} ${rhythm(1.5)}`,
          marginTop: `${blogTitle && blogDate ? '0' : '6rem'}`
        }}
      >
        <main>{children}</main>
      </div>
      <Footer>
        © {new Date().getFullYear()}, Built with
          {` `}
        <a href="https://www.gatsbyjs.org">Gatsby</a>
        <div>
          <a href="https://beian.miit.gov.cn/" target="_blank">浙ICP备17017036号</a>
        </div>
      </Footer>
    </Wrapper>
  )
  // }
}

const Wrapper = styled.div`
  min-height: 100vh;
`

const Footer = styled.footer`
  text-align: center;
  margin: 24px;
`

export default Layout
